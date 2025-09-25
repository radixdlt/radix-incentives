import { transactionCounts, weeks } from 'db/incentives';
import { asc, desc, eq, gte, lte } from 'drizzle-orm';
import { Config, Data, Effect } from 'effect';
import { z } from 'zod';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

class TransactionCountFetchError extends Data.TaggedError(
  'TransactionCountFetchError',
)<{
  message: string;
  cause?: unknown;
}> {}

class TransactionCountParseError extends Data.TaggedError(
  'TransactionCountParseError',
)<{
  message: string;
  cause?: unknown;
}> {}

class TransactionCountValidationError extends Data.TaggedError(
  'TransactionCountValidationError',
)<{
  message: string;
  cause?: unknown;
}> {}

/**
 * Radix API response schema
 */
export const RadixApiResponse = z.object({
  data: z.object({
    total: z.object({
      transaction_count: z.number(),
    }),
  }),
  code: z.number(),
  time_utc: z.number(),
});

export type RadixApiResponseData = z.infer<typeof RadixApiResponse>;

export interface TransactionCountData {
  totalTransactionCount: number;
  timestamp: Date;
}

/**
 * Service for managing transaction count data from Radix Charts API
 */
export class TransactionCountService extends Effect.Service<TransactionCountService>()(
  'TransactionCountService',
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      const authToken = yield* Config.string(
        'RADIX_CHARTS_AUTHORIZATION_TOKEN',
      ).pipe(Config.withDefault('admin-readonly-token'));

      const fetchCurrentTransactionCount = Effect.fn(function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch('https://api.radixapi.net/v1/network/statistics', {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            }),
          catch: (error) =>
            new TransactionCountFetchError({
              message: 'Failed to fetch transaction count from Radix API',
              cause: error,
            }),
        });

        if (!response.ok) {
          return yield* Effect.fail(
            new TransactionCountFetchError({
              message: `HTTP ${response.status}: ${response.statusText}`,
            }),
          );
        }

        const rawData = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) =>
            new TransactionCountParseError({
              message: 'Failed to parse Radix API response',
              cause: error,
            }),
        });

        const data = yield* Effect.try({
          try: () => RadixApiResponse.parse(rawData),
          catch: (error) =>
            new TransactionCountValidationError({
              message: 'Invalid transaction count data format from Radix API',
              cause: error,
            }),
        });

        if (data.code !== 200) {
          return yield* Effect.fail(
            new TransactionCountFetchError({
              message: `API returned code ${data.code}`,
            }),
          );
        }

        return {
          totalTransactionCount: data.data.total.transaction_count,
          timestamp: new Date(),
        };
      });

      const getTransactionCountAtTimestamp = Effect.fn(function* (
        timestamp: Date,
      ) {
        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(transactionCounts)
              .where(lte(transactionCounts.timestamp, timestamp))
              .orderBy(desc(transactionCounts.timestamp))
              .limit(1),
          catch: (error) => new DbError(error),
        });

        return result[0] || null;
      });

      return {
        /**
         * Fetch current transaction count from Radix Charts API
         */
        fetchCurrentTransactionCount,

        /**
         * Update transaction count table with current data
         */
        updateTransactionCount: Effect.fn(function* () {
          const currentData = yield* fetchCurrentTransactionCount();

          const result = yield* Effect.tryPromise({
            try: () =>
              db
                .insert(transactionCounts)
                .values({
                  totalTransactionCount: currentData.totalTransactionCount,
                  timestamp: currentData.timestamp,
                })
                .onConflictDoNothing()
                .returning(),
            catch: (error) => new DbError(error),
          });

          // If conflict (duplicate timestamp), get the existing record
          if (result.length === 0) {
            const existing = yield* Effect.tryPromise({
              try: () =>
                db
                  .select()
                  .from(transactionCounts)
                  .where(eq(transactionCounts.timestamp, currentData.timestamp))
                  .limit(1),
              catch: (error) => new DbError(error),
            });
            return existing[0];
          }

          return result[0];
        }),

        /**
         * Get the latest transaction count record
         */
        getLatestTransactionCount: Effect.fn(function* () {
          const result = yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(transactionCounts)
                .orderBy(desc(transactionCounts.timestamp))
                .limit(1),
            catch: (error) => new DbError(error),
          });

          return result[0] || null;
        }),

        /**
         * Get transaction count at a specific timestamp (or closest before)
         */
        getTransactionCountAtTimestamp,

        /**
         * Calculate average weekly transactions for a season
         */
        calculateAverageWeeklyTransactionsForSeason: Effect.fn(function* (
          seasonId: string,
        ) {
          // Get the first week start date for this season (or season start if no weeks)
          const firstWeek = yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(weeks)
                .where(eq(weeks.seasonId, seasonId))
                .orderBy(asc(weeks.startDate))
                .limit(1),
            catch: (error) => new DbError(error),
          });

          // Get the latest week end date for this season
          const lastWeek = yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(weeks)
                .where(eq(weeks.seasonId, seasonId))
                .orderBy(desc(weeks.endDate))
                .limit(1),
            catch: (error) => new DbError(error),
          });

          if (firstWeek.length === 0 || lastWeek.length === 0) {
            return 0;
          }

          const firstWeekData = firstWeek[0];
          const lastWeekData = lastWeek[0];

          if (!firstWeekData || !lastWeekData) {
            return 0;
          }

          const seasonStartDate = new Date(firstWeekData.startDate);
          const seasonEndDate = new Date(lastWeekData.endDate);

          // Limit end date to current time if season is ongoing
          const effectiveEndDate =
            seasonEndDate > new Date() ? new Date() : seasonEndDate;

          // Get the FIRST transaction count data at or AFTER season start
          const startCount = yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(transactionCounts)
                .where(gte(transactionCounts.timestamp, seasonStartDate))
                .orderBy(asc(transactionCounts.timestamp))
                .limit(1),
            catch: (error) => new DbError(error),
          });

          if (startCount.length === 0) {
            return 0;
          }

          const startCountData = startCount[0];

          if (!startCountData) {
            return 0;
          }

          // Get latest transaction count within season timeframe
          const endCount =
            yield* getTransactionCountAtTimestamp(effectiveEndDate);

          if (!endCount) {
            return 0;
          }

          // Calculate time difference in days using ACTUAL data timestamps
          const endTimestamp = new Date(endCount.timestamp);
          const startTimestamp = new Date(startCountData.timestamp);

          const timeDiffMs = endTimestamp.getTime() - startTimestamp.getTime();
          const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);

          if (timeDiffDays <= 0) {
            return 0;
          }

          // Calculate total transactions in the period
          const totalTransactions =
            endCount.totalTransactionCount -
            startCountData.totalTransactionCount;

          // Calculate average per week (7 days)
          const averageWeeklyTransactions =
            (totalTransactions / timeDiffDays) * 7;

          return Math.round(averageWeeklyTransactions);
        }),
      } as const;
    }),
    dependencies: [dbClientLive],
  },
) {}

export const TransactionCountServiceLive = TransactionCountService.Default;

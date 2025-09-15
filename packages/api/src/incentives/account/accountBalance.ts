import { accountBalances } from 'db/incentives';
import { and, between, desc, inArray } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';

export type AccountBalanceItem = {
  activityId: string;
  usdValue: string;
  metadata?: Record<string, unknown>;
};

export type LatestAccountBalance = {
  accountAddress: string;
  timestamp: Date;
  data: AccountBalanceItem[];
};

export type CapitalAggregation = {
  capitalByCategory: Map<string, number>;
  capitalByActivity: Map<string, number>;
};

export class AccountBalanceService extends Effect.Service<AccountBalanceService>()(
  'AccountBalanceService',
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      return {
        getLatest: (accountAddresses: string[]) =>
          Effect.gen(function* () {
            if (accountAddresses.length === 0) {
              return [];
            }
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Get the latest snapshot for each account address
            const rawBalances = yield* Effect.tryPromise({
              try: () =>
                db
                  .selectDistinctOn([accountBalances.accountAddress], {
                    accountAddress: accountBalances.accountAddress,
                    timestamp: accountBalances.timestamp,
                    data: accountBalances.data,
                  })
                  .from(accountBalances)
                  .where(
                    and(
                      inArray(accountBalances.accountAddress, accountAddresses),
                      between(
                        accountBalances.timestamp,
                        sevenDaysAgo,
                        new Date(),
                      ),
                    ),
                  )
                  .orderBy(
                    accountBalances.accountAddress,
                    desc(accountBalances.timestamp),
                  )
                  .execute(),
              catch: (error) => new DbError(error),
            });

            // Cast the data to the proper type
            const latestBalances: LatestAccountBalance[] = rawBalances.map(
              (balance) => ({
                accountAddress: balance.accountAddress,
                timestamp: balance.timestamp,
                data: balance.data as AccountBalanceItem[],
              }),
            );

            return latestBalances;
          }),
        aggregateCapitalByActivity: Effect.fn(function* (input: {
          latestBalances: LatestAccountBalance[];
          activeActivityIds: string[];
          activityToCategoryMap: Map<string, string>;
        }) {
          const capitalByCategory = new Map<string, number>();
          const capitalByActivity = new Map<string, number>();

          // Group account balances by category and activity, but only for active activities
          for (const balance of input.latestBalances) {
            for (const item of balance.data) {
              // Only include activities with multiplier > 0
              if (!input.activeActivityIds.includes(item.activityId)) {
                continue;
              }

              const categoryId = input.activityToCategoryMap.get(
                item.activityId,
              );
              if (categoryId && item.usdValue) {
                const usdValue = parseFloat(item.usdValue);

                // Category totals
                const currentCapital = capitalByCategory.get(categoryId) || 0;
                capitalByCategory.set(categoryId, currentCapital + usdValue);

                // Individual activity totals
                const currentActivityCapital =
                  capitalByActivity.get(item.activityId) || 0;
                capitalByActivity.set(
                  item.activityId,
                  currentActivityCapital + usdValue,
                );
              }
            }
          }

          return {
            capitalByCategory,
            capitalByActivity,
          };
        }),
      };
    }),
  },
) {}

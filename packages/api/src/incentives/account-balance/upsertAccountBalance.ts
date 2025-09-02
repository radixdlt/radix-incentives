import { accountBalances } from 'db/incentives';
import { sql } from 'drizzle-orm';
import { Config, Effect } from 'effect';
import { chunker } from '../../common';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

type UpsertAccountBalanceInput = {
  timestamp: Date;
  accountAddress: string;
  data?: unknown;
}[];

export class UpsertAccountBalancesService extends Effect.Service<UpsertAccountBalancesService>()(
  'UpsertAccountBalancesService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const batchSize = yield* Config.number('INSERT_BATCH_SIZE').pipe(
        Config.withDefault(5000),
      );
      const db = yield* DbClientService;
      return Effect.fn(function* (input: UpsertAccountBalanceInput) {
        yield* Effect.forEach(
          chunker(input, batchSize),
          Effect.fn(function* (items) {
            yield* Effect.tryPromise({
              try: async () => {
                await db
                  .insert(accountBalances)
                  .values(
                    items.map(({ timestamp, accountAddress, data = {} }) => ({
                      timestamp,
                      accountAddress,
                      data,
                    })),
                  )
                  .onConflictDoUpdate({
                    target: [
                      accountBalances.accountAddress,
                      accountBalances.timestamp,
                    ],
                    set: {
                      data: sql`excluded.data`,
                    },
                  });
              },
              catch: (error) => new DbError(error),
            }).pipe(Effect.withSpan('upsertAccountBalancesBatch'));
          }),
        );
      });
    }),
  },
) {}

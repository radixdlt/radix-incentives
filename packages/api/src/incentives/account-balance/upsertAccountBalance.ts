import { accountBalances } from 'db/incentives';
import { sql } from 'drizzle-orm';
import { Config, Effect } from 'effect';
import { chunker } from '../../common';
import { DbService } from '../db/dbClient';

type UpsertAccountBalanceInput = {
  timestamp: Date;
  accountAddress: string;
  data?: unknown;
}[];

export class UpsertAccountBalancesService extends Effect.Service<UpsertAccountBalancesService>()(
  'UpsertAccountBalancesService',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const batchSize = yield* Config.number('INSERT_BATCH_SIZE').pipe(
        Config.withDefault(5000),
      );
      const db = yield* DbService;
      return Effect.fn(function* (input: UpsertAccountBalanceInput) {
        yield* Effect.forEach(
          chunker(input, batchSize),
          Effect.fn(function* (items) {
            yield* db
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
              })
              .pipe(Effect.withSpan('upsertAccountBalancesBatch'));
          }),
        );
      });
    }),
  },
) {}

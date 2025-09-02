import { seasonPointsMultiplier } from 'db/incentives';
import { sql } from 'drizzle-orm';
import { Config, Effect } from 'effect';
import { chunker } from '../../common';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export class UpsertUserTwaWithMultiplierService extends Effect.Service<UpsertUserTwaWithMultiplierService>()(
  'UpsertUserTwaWithMultiplierService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      // PostgreSQL typically has a limit of 65535 parameters, so we'll use a safe batch size
      const BATCH_SIZE = yield* Config.number('INSERT_BATCH_SIZE').pipe(
        Config.withDefault(5000),
      );
      const db = yield* DbClientService;
      return Effect.fn(function* (
        input: (typeof seasonPointsMultiplier.$inferInsert)[],
      ) {
        const makeRequest = (
          items: (typeof seasonPointsMultiplier.$inferInsert)[],
        ) =>
          Effect.tryPromise({
            try: async () => {
              await db
                .insert(seasonPointsMultiplier)
                .values(items)
                .onConflictDoUpdate({
                  target: [
                    seasonPointsMultiplier.userId,
                    seasonPointsMultiplier.weekId,
                  ],
                  set: {
                    multiplier: sql`excluded.multiplier`,
                    totalTWABalance: sql`excluded.total_twa_balance`,
                    cumulativeTWABalance: sql`excluded.cumulative_twa_balance`,
                  },
                });
            },
            catch: (error) => new DbError(error),
          }).pipe(Effect.withSpan('upsertUserTwaWithMultiplierBatch'));

        yield* Effect.forEach(chunker(input, BATCH_SIZE), makeRequest, {
          concurrency: 1,
        });
      });
    }),
  },
) {}

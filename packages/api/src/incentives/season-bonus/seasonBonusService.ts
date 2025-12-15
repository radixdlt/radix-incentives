import { userSeasonBonuses } from 'db/incentives';
import { and, eq, sql } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbService } from '../db/dbClient';
import type { SeasonBonusEntry } from './parseCsvSeasonBonus';

export class SeasonBonusService extends Effect.Service<SeasonBonusService>()(
  'SeasonBonusService',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;

      return {
        /**
         * Get season bonus for a specific user and season
         */
        getSeasonBonus: Effect.fn(function* (userId: string, seasonId: string) {
          const result = yield* db.use((db) =>
            db
              .select({ seasonBonus: userSeasonBonuses.seasonBonus })
              .from(userSeasonBonuses)
              .where(
                and(
                  eq(userSeasonBonuses.userId, userId),
                  eq(userSeasonBonuses.seasonId, seasonId),
                ),
              )
              .limit(1),
          );

          return result[0]?.seasonBonus ?? null;
        }),

        /**
         * Upload season bonuses from CSV (upsert operation)
         */
        uploadCsv: Effect.fn(function* (entries: SeasonBonusEntry[]) {
          yield* db.use((db) =>
            db.transaction(async (tx) => {
              // Batch insert entries with ON CONFLICT DO UPDATE
              const batchSize = 1000;
              for (let i = 0; i < entries.length; i += batchSize) {
                const batch = entries.slice(i, i + batchSize);

                const values = batch.map((entry) => ({
                  userId: entry.userId,
                  seasonId: entry.seasonId,
                  seasonBonus: entry.seasonBonus.toString(),
                }));

                await tx
                  .insert(userSeasonBonuses)
                  .values(values)
                  .onConflictDoUpdate({
                    target: [
                      userSeasonBonuses.userId,
                      userSeasonBonuses.seasonId,
                    ],
                    set: {
                      seasonBonus: sql`excluded.season_bonus`,
                    },
                  });
              }
            }),
          );
        }),

        /**
         * Get total count of season bonus records
         */
        getCount: () =>
          Effect.gen(function* () {
            const result = yield* db.use((db) =>
              db
                .select({ userId: userSeasonBonuses.userId })
                .from(userSeasonBonuses),
            );
            return result.length;
          }),
      };
    }),
  },
) {}

export const SeasonBonusServiceLive = SeasonBonusService.Default;

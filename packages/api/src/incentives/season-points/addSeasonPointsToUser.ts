import type BigNumber from 'bignumber.js';
import { userSeasonPoints } from 'db/incentives';
import { sql } from 'drizzle-orm';
import { Effect } from 'effect';
import { chunker } from '../../common';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export type AddSeasonPointsToUserInput = {
  userId: string;
  seasonId: string;
  weekId: string;
  points: BigNumber;
  referralPoints: BigNumber;
  data?: Record<string, string>;
}[];

export class AddSeasonPointsToUserService extends Effect.Service<AddSeasonPointsToUserService>()(
  'AddSeasonPointsToUserService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* (input: AddSeasonPointsToUserInput) {
          if (input.length === 0) {
            yield* Effect.log('empty input, skipping');
            return;
          }

          return yield* Effect.forEach(chunker(input, 1000), (chunk) => {
            return Effect.gen(function* () {
              return yield* Effect.tryPromise({
                try: () =>
                  db
                    .insert(userSeasonPoints)
                    .values(
                      chunk.map((item) => ({
                        userId: item.userId,
                        seasonId: item.seasonId,
                        weekId: item.weekId,
                        points: item.points.decimalPlaces(6).toString(),
                        referralPoints: item.referralPoints
                          .decimalPlaces(6)
                          .toString(),
                        data: item.data,
                      })),
                    )
                    .onConflictDoUpdate({
                      target: [
                        userSeasonPoints.userId,
                        userSeasonPoints.seasonId,
                        userSeasonPoints.weekId,
                      ],
                      set: {
                        points: sql`excluded.points`,
                        referralPoints: sql`excluded.referral_points`,
                        data: sql`excluded.data`,
                      },
                    }),
                catch: (error) => new DbError(error),
              });
            });
          });
        }),
      };
    }),
  },
) {}

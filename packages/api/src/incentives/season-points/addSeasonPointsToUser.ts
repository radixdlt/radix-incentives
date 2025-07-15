import { Effect } from "effect";
import type BigNumber from "bignumber.js";
import { DbClientService, DbError } from "../db/dbClient";
import { chunker } from "../../common";
import { userSeasonPoints } from "db/incentives";
import { sql } from "drizzle-orm";

export type AddSeasonPointsToUserInput = {
  userId: string;
  seasonId: string;
  weekId: string;
  points: BigNumber;
}[];

export class AddSeasonPointsToUserService extends Effect.Service<AddSeasonPointsToUserService>()(
  "AddSeasonPointsToUserService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* (input: AddSeasonPointsToUserInput) {
          if (input.length === 0) {
            yield* Effect.log("empty input, skipping");
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
                      }))
                    )
                    .onConflictDoUpdate({
                      target: [
                        userSeasonPoints.userId,
                        userSeasonPoints.seasonId,
                        userSeasonPoints.weekId,
                      ],
                      set: {
                        points: sql`excluded.points`,
                      },
                    }),
                catch: (error) => new DbError(error),
              });
            });
          });
        }),
      };
    }),
  }
) {}

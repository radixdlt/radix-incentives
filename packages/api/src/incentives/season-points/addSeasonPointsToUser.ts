import { Context, Layer, Effect } from "effect";
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

export type AddSeasonPointsToUserOutput = {
  userId: string;
  seasonId: string;
  weekId: string;
  points: BigNumber;
}[];

export type AddSeasonPointsToUserServiceError = DbError;

export class AddSeasonPointsToUserService extends Context.Tag(
  "AddSeasonPointsToUserService"
)<
  AddSeasonPointsToUserService,
  (
    input: AddSeasonPointsToUserInput
  ) => Effect.Effect<void, AddSeasonPointsToUserServiceError>
>() {}

export const AddSeasonPointsToUserLive = Layer.effect(
  AddSeasonPointsToUserService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
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
                      points: item.points.decimalPlaces(0).toNumber(),
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
      });
  })
);

import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { seasons, type Season } from "db/incentives";
import { eq } from "drizzle-orm";

export class SeasonNotFoundError {
  readonly _tag = "SeasonNotFoundError";
  constructor(readonly message: string) {}
}

export type GetSeasonByIdError = DbError | SeasonNotFoundError;

export class GetSeasonByIdService extends Context.Tag("GetSeasonByIdService")<
  GetSeasonByIdService,
  (input: {
    id: string;
  }) => Effect.Effect<Season, GetSeasonByIdError, DbClientService>
>() {}

export const GetSeasonByIdLive = Layer.effect(
  GetSeasonByIdService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        const season = yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(seasons)
              .where(eq(seasons.id, input.id))
              .limit(1)
              .then((r) => r[0]),
          catch: (error) => new DbError(error),
        });

        if (!season) {
          return yield* Effect.fail(
            new SeasonNotFoundError(`season ${input.id} not found`)
          );
        }

        return season;
      });
  })
);

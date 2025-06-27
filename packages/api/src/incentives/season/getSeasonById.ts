import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { seasons, type Week, type Season } from "db/incentives";
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
    includeWeeks?: boolean;
  }) => Effect.Effect<Season & { weeks?: Week[] }, GetSeasonByIdError>
>() {}

export const GetSeasonByIdLive = Layer.effect(
  GetSeasonByIdService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        const season = yield* Effect.tryPromise({
          try: () =>
            db.query.seasons.findFirst({
              where: eq(seasons.id, input.id),
              with: {
                weeks: input.includeWeeks ? true : undefined,
              },
            }),
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

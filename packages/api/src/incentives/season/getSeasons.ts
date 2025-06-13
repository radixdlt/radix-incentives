import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { seasons, type Season } from "db/incentives";

export type GetSeasonsError = DbError;

export class GetSeasonsService extends Context.Tag("GetSeasonsService")<
  GetSeasonsService,
  () => Effect.Effect<Season[], GetSeasonsError, DbClientService>
>() {}

export const GetSeasonsLive = Layer.effect(
  GetSeasonsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return () =>
      Effect.gen(function* () {
        return yield* Effect.tryPromise({
          try: () => db.select().from(seasons),
          catch: (error) => new DbError(error),
        });
      });
  })
);

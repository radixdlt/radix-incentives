import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { type Week, weeks } from "db/incentives";
import { eq } from "drizzle-orm";

export class WeekNotFoundError {
  readonly _tag = "WeekNotFoundError";
  constructor(readonly message: string) {}
}

export type GetWeekByIdError = DbError | WeekNotFoundError;

export class GetWeekByIdService extends Context.Tag("GetWeekByIdService")<
  GetWeekByIdService,
  (input: { id: string }) => Effect.Effect<Week, GetWeekByIdError>
>() {}

export const GetWeekByIdLive = Layer.effect(
  GetWeekByIdService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        const week = yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(weeks)
              .where(eq(weeks.id, input.id))
              .limit(1)
              .then((r) => r[0]),
          catch: (error) => new DbError(error),
        });

        if (!week) {
          return yield* Effect.fail(
            new WeekNotFoundError(`week ${input.id} not found`)
          );
        }

        return week;
      });
  })
);

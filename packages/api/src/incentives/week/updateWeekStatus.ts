import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { type Week, weeks } from "db/incentives";
import { eq } from "drizzle-orm";

export type UpdateWeekStatusError = DbError;

export class UpdateWeekStatusService extends Context.Tag(
  "UpdateWeekStatusService"
)<
  UpdateWeekStatusService,
  (input: {
    id: string;
    status: Week["status"];
  }) => Effect.Effect<void, UpdateWeekStatusError>
>() {}

export const UpdateWeekStatusLive = Layer.effect(
  UpdateWeekStatusService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db
              .update(weeks)
              .set({ status: input.status })
              .where(eq(weeks.id, input.id)),
          catch: (error) => new DbError(error),
        });
      });
  })
);

import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { activityWeeks, type ActivityWeek } from "db/incentives";
import { eq } from "drizzle-orm";

export class NotFoundError {
  readonly _tag = "NotFoundError";
  constructor(readonly message: string) {}
}

export type GetActivitiesByWeekIdError = DbError | NotFoundError;

export class GetActivitiesByWeekIdService extends Context.Tag(
  "GetActivitiesByWeekIdService"
)<
  GetActivitiesByWeekIdService,
  (input: {
    weekId: string;
  }) => Effect.Effect<
    ActivityWeek[],
    GetActivitiesByWeekIdError,
    DbClientService
  >
>() {}

export const GetActivitiesByWeekIdLive = Layer.effect(
  GetActivitiesByWeekIdService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(activityWeeks)
              .where(eq(activityWeeks.weekId, input.weekId)),
          catch: (error) => new DbError(error),
        });

        if (result.length === 0) {
          return yield* Effect.fail(
            new NotFoundError(`activity week ${input.weekId} not found`)
          );
        }

        return result;
      });
  })
);

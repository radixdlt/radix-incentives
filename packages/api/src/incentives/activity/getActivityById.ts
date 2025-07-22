import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import {
  activities,
  activityWeeks,
  type Week,
  type ActivityWeek,
} from "db/incentives";
import { eq } from "drizzle-orm";
import type { ActivityId } from "data";
import type { Activity } from "./activity";

export class NotFoundError {
  readonly _tag = "NotFoundError";
  constructor(readonly message: string) {}
}

export type GetActivityByIdError = DbError | NotFoundError;

export class GetActivityByIdService extends Context.Tag(
  "GetActivityByIdService"
)<
  GetActivityByIdService,
  (input: { id: string }) => Effect.Effect<
    {
      activity: Activity;
      activityWeeks: (ActivityWeek & { week: Week })[];
    },
    GetActivityByIdError
  >
>() {}

export const GetActivityByIdLive = Layer.effect(
  GetActivityByIdService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        const activityResult = yield* Effect.tryPromise({
          try: () =>
            db.query.activities.findFirst({
              where: eq(activities.id, input.id),
            }),
          catch: (error) => new DbError(error),
        });

        if (!activityResult) {
          return yield* Effect.fail(
            new NotFoundError(`activity ${input.id} not found`)
          );
        }

        const activityWeeksResult = yield* Effect.tryPromise({
          try: () =>
            db.query.activityWeeks.findMany({
              where: eq(activityWeeks.activityId, input.id),
              with: {
                week: true,
              },
            }),
          catch: (error) => new DbError(error),
        });

        return {
          activity: activityResult as Activity,
          activityWeeks: activityWeeksResult.map((week) => ({
            ...week,
            activityId: week.activityId as ActivityId,
          })),
        };
      });
  })
);

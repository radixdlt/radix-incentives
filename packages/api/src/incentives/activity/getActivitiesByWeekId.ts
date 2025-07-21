import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { activities, activityWeeks, type ActivityWeek } from "db/incentives";
import type { ActivityCategoryId, ActivityId } from "data";
import { and, eq, inArray, notInArray } from "drizzle-orm";

export class NotFoundError {
  readonly _tag = "NotFoundError";
  constructor(readonly message: string) {}
}

export type GetActivitiesByWeekIdError = DbError | NotFoundError;

export type GetActivitiesByWeekIdServiceOutput = (ActivityWeek & {
  activityId: ActivityId;
  category: ActivityCategoryId;
})[];

export class GetActivitiesByWeekIdService extends Context.Tag(
  "GetActivitiesByWeekIdService"
)<
  GetActivitiesByWeekIdService,
  (input: {
    weekId: string;
    excludeCategories?: ActivityCategoryId[];
    includeCategories?: ActivityCategoryId[];
  }) => Effect.Effect<
    GetActivitiesByWeekIdServiceOutput,
    GetActivitiesByWeekIdError
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
              .innerJoin(
                activities,
                eq(activityWeeks.activityId, activities.id)
              )
              .where(
                and(
                  eq(activityWeeks.weekId, input.weekId),
                  ...(input.excludeCategories
                    ? [notInArray(activities.category, input.excludeCategories)]
                    : []),
                  ...(input.includeCategories
                    ? [inArray(activities.category, input.includeCategories)]
                    : [])
                )
              ),
          catch: (error) => new DbError(error),
        });

        if (result.length === 0) {
          return yield* Effect.fail(
            new NotFoundError(`activity week ${input.weekId} not found`)
          );
        }

        // Transform the result to match the expected ActivityWeek format
        return result.map((row) => ({
          ...row.activity_week,
          activityId: row.activity_week.activityId as ActivityId,
          category: row.activity.category as ActivityCategoryId,
        }));
      });
  })
);

import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import {
  type ActivityId,
  type ActivityWeek,
  activityWeeks,
} from "db/incentives";
import { inArray } from "drizzle-orm";

export type GetActivityWeeksError = DbError;
export type GetActivityWeeksServiceDependency = DbClientService;

export class GetActivityWeeksByWeekIdsService extends Context.Tag(
  "GetActivityWeeksByWeekIdsService"
)<
  GetActivityWeeksByWeekIdsService,
  (input: {
    ids: string[];
  }) => Effect.Effect<
    ActivityWeek[],
    GetActivityWeeksError,
    GetActivityWeeksServiceDependency
  >
>() {}

export const GetActivityWeeksByWeekIdsLive = Layer.effect(
  GetActivityWeeksByWeekIdsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        const week = yield* Effect.tryPromise({
          try: () =>
            db.query.activityWeeks.findMany({
              where: inArray(activityWeeks.weekId, input.ids),
            }),
          catch: (error) => new DbError(error),
        });

        return week.map((week) => ({
          ...week,
          activityId: week.activityId as ActivityId,
        }));
      });
  })
);

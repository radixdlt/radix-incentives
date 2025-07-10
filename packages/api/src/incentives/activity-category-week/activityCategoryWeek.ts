import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import {
  type ActivityCategoryKey,
  activityCategoryWeeks,
  activityWeeks,
} from "db/incentives";
import { eq } from "drizzle-orm";
import { groupBy } from "effect/Array";
import BigNumber from "bignumber.js";
import { distributeWeightedPoints } from "./distributeWeightedPoints";

export class ActivityCategoryWeekService extends Effect.Service<ActivityCategoryWeekService>()(
  "ActivityCategoryWeekService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        getByWeekId: Effect.fn(function* (input: { weekId: string }) {
          const activityCategories = yield* Effect.tryPromise({
            try: () =>
              db.query.activityCategoryWeeks.findMany({
                where: eq(activityCategoryWeeks.weekId, input.weekId),
                columns: {
                  activityCategoryId: true,
                  pointsPool: true,
                },
              }),
            catch: (error) => new DbError(error),
          });

          const activities = yield* Effect.tryPromise({
            try: () =>
              db.query.activityWeeks.findMany({
                where: eq(activityWeeks.weekId, input.weekId),
                with: {
                  activity: {
                    columns: {
                      category: true,
                    },
                  },
                },
                columns: {
                  activityId: true,
                  multiplier: true,
                },
              }),
            catch: (error) => new DbError(error),
          });

          const categoryPointsMap = groupBy(
            activityCategories,
            (item) => item.activityCategoryId
          );

          const groupedByCategory = groupBy(
            activities,
            (item) => item.activity.category
          );

          // distribute points according to their multiplier
          return yield* Effect.forEach(
            Object.entries(groupedByCategory),
            Effect.fn(function* ([categoryId, activities]) {
              const pointsPool = new BigNumber(
                categoryPointsMap[categoryId]?.[0]?.pointsPool ?? 0
              );

              return yield* distributeWeightedPoints({
                pointsPool,
                items: activities.map((item) => ({
                  id: item.activityId,
                  multiplier: new BigNumber(item.multiplier),
                })),
              }).pipe(
                Effect.map((items) =>
                  items.map((item) => ({
                    points: item.points,
                    activityId: item.id,
                    categoryId: categoryId as ActivityCategoryKey,
                  }))
                )
              );
            })
          ).pipe(Effect.map((items) => items.flat()));
        }),
      };
    }),
  }
) {}

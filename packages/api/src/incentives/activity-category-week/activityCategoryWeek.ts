import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { activityCategoryWeeks, activityWeeks } from "db/incentives";
import { eq, gt, and } from "drizzle-orm";
import { groupBy } from "effect/Array";
import BigNumber from "bignumber.js";
import type { ActivityCategoryId } from "data";

export class ActivityCategoryWeekService extends Effect.Service<ActivityCategoryWeekService>()(
  "ActivityCategoryWeekService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        getByWeekId: Effect.fn(function* (input: { weekId: string }) {
          const [activityCategories, activities] = yield* Effect.all([
            Effect.tryPromise({
              try: () =>
                db.query.activityCategoryWeeks.findMany({
                  where: and(
                    eq(activityCategoryWeeks.weekId, input.weekId),
                    gt(activityCategoryWeeks.pointsPool, 0)
                  ),
                  columns: {
                    activityCategoryId: true,
                    pointsPool: true,
                  },
                }),
              catch: (error) => new DbError(error),
            }),
            Effect.tryPromise({
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
            }),
          ]);

          const categoryPointsMap = groupBy(
            activityCategories,
            (item) => item.activityCategoryId
          );

          const groupedByCategory = groupBy(
            activities,
            (item) => item.activity.category
          );

          return yield* Effect.forEach(
            Object.entries(groupedByCategory),
            Effect.fn(function* ([categoryId, activities]) {
              const pointsPool = new BigNumber(
                categoryPointsMap[categoryId]?.[0]?.pointsPool ?? 0
              );

              if (pointsPool.isZero()) {
                return;
              }

              return {
                categoryId: categoryId as ActivityCategoryId,
                activities: activities.map((item) => ({
                  id: item.activityId,
                  multiplier: new BigNumber(item.multiplier),
                })),
                pointsPool,
              };
            })
          ).pipe(
            Effect.map((items) => items.filter((item) => item !== undefined))
          );
        }),
      };
    }),
  }
) {}

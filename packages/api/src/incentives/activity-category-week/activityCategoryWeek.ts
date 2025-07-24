import BigNumber from 'bignumber.js';
import { ActivityCategoryId } from 'data';
import { activityCategoryWeeks, activityWeeks } from 'db/incentives';
import { and, eq, gt, sql } from 'drizzle-orm';
import { Effect } from 'effect';
import { groupBy } from 'effect/Array';
import { DbClientService, DbError } from '../db/dbClient';

export class ActivityCategoryWeekService extends Effect.Service<ActivityCategoryWeekService>()(
  'ActivityCategoryWeekService',
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      return {
        getByWeekId: Effect.fn(function* (input: { weekId: string }) {
          const [activityCategories, activities] = yield* Effect.all([
            Effect.tryPromise({
              try: () =>
                db.query.activityCategoryWeeks.findMany({
                  where: and(eq(activityCategoryWeeks.weekId, input.weekId)),
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

          const groupedByCategory = groupBy(
            activities,
            (item) => item.activity.category,
          );

          return yield* Effect.forEach(
            activityCategories,
            Effect.fn(function* (categoryWeek) {
              const pointsPool = new BigNumber(categoryWeek.pointsPool);

              const categoryActivities =
                groupedByCategory[categoryWeek.activityCategoryId] ?? [];

              return {
                categoryId:
                  categoryWeek.activityCategoryId as ActivityCategoryId,
                activities: categoryActivities.map((item) => ({
                  id: item.activityId,
                  multiplier: new BigNumber(item.multiplier),
                })),
                pointsPool,
              };
            }),
          );
        }),
        updatePointsPool: Effect.fn(function* (input: {
          weekId: string;
          activityCategoryId: string;
          pointsPool: number;
        }) {
          yield* Effect.tryPromise({
            try: () =>
              db
                .update(activityCategoryWeeks)
                .set({
                  pointsPool: input.pointsPool,
                })
                .where(
                  and(
                    eq(activityCategoryWeeks.weekId, input.weekId),
                    eq(
                      activityCategoryWeeks.activityCategoryId,
                      input.activityCategoryId,
                    ),
                  ),
                ),
            catch: (error) => new DbError(error),
          });
        }),
        cloneByWeekId: Effect.fn(function* (input: {
          fromWeekId: string | undefined;
          toWeekId: string;
        }) {
          const activityCategoriesMap = input.fromWeekId
            ? yield* Effect.tryPromise({
                try: () =>
                  db.query.activityCategoryWeeks
                    .findMany({
                      where: and(
                        eq(activityCategoryWeeks.weekId, input.fromWeekId!),
                      ),
                    })
                    .then((items) =>
                      items.reduce(
                        (acc, item) => {
                          acc[item.activityCategoryId] = item;
                          return acc;
                        },
                        {} as Record<
                          string,
                          {
                            weekId: string;
                            activityCategoryId: string;
                            pointsPool: number;
                          }
                        >,
                      ),
                    ),
                catch: (error) => new DbError(error),
              })
            : {};

          const items = Object.values(ActivityCategoryId).map((item) => ({
            activityCategoryId: item,
            weekId: input.toWeekId,
            pointsPool: activityCategoriesMap[item]?.pointsPool ?? 0,
          }));

          yield* Effect.tryPromise({
            try: () =>
              db
                .insert(activityCategoryWeeks)
                .values(items)
                .onConflictDoUpdate({
                  target: [
                    activityCategoryWeeks.weekId,
                    activityCategoryWeeks.activityCategoryId,
                  ],
                  set: {
                    pointsPool: sql`excluded.points_pool`,
                  },
                }),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  },
) {}

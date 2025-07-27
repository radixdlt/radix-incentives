import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { activityCategories, activities } from "db/incentives";
import { asc, sql, eq } from "drizzle-orm";
import { Data } from "effect";
import { z } from "zod";

export const ActivityCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;

class ActivityCategoryNotFoundError extends Data.TaggedError("ActivityCategoryNotFoundError")<{
  message: string;
}> {}

export class ActivityCategoryService extends Effect.Service<ActivityCategoryService>()(
  "ActivityCategoryService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        list: Effect.fn(function* () {
          const activityCategories = yield* Effect.tryPromise({
            try: () => db.query.activityCategories.findMany(),
            catch: (error) => new DbError(error),
          });
          return activityCategories as ActivityCategory[];
        }),
        getById: Effect.fn(function* (id: string) {
          const category = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  id: activityCategories.id,
                  name: activityCategories.name,
                  description: activityCategories.description,
                })
                .from(activityCategories)
                .where(eq(activityCategories.id, id))
                .limit(1)
                .then((result) => result[0]),
            catch: (error) => new DbError(error),
          });

          if (!category) {
            return yield* Effect.fail(
              new ActivityCategoryNotFoundError({
                message: `Activity category ${id} not found`,
              })
            );
          }

          return category;
        }),
        getAvailable: Effect.fn(function* () {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  id: activityCategories.id,
                  name: activityCategories.name,
                  description: activityCategories.description,
                })
                .from(activityCategories)
                .where(
                  // Exclude categories that don't have any non-hold, non-common activities
                  sql`EXISTS (
                    SELECT 1 FROM ${activities}
                    WHERE ${activities.category} = ${activityCategories.id}
                    AND ${activities.id} NOT LIKE '%hold_%'
                    AND ${activities.id} != 'common'
                  )`
                )
                .orderBy(asc(activityCategories.name)),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}

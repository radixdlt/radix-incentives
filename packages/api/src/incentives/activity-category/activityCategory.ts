import { activityCategories } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Data, Effect } from 'effect';
import { z } from 'zod';
import { DbClientService, DbError } from '../db/dbClient';

export const ActivityCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;

class ActivityCategoryNotFoundError extends Data.TaggedError(
  'ActivityCategoryNotFoundError',
)<{
  message: string;
}> {}

export class ActivityCategoryService extends Effect.Service<ActivityCategoryService>()(
  'ActivityCategoryService',
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
              }),
            );
          }

          return category;
        }),
      };
    }),
  },
) {}

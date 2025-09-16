import { activityCategories } from 'db/incentives';
import { eq } from 'drizzle-orm';
import { Data, Effect } from 'effect';
import { z } from 'zod';
import { DbClientService, DbError } from '../db/dbClient';

export const ActivityCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  dappIds: z.array(z.string()).optional(),
  showOnEarnPage: z.boolean().optional(),
  multiplier: z.boolean().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const UpdateActivityCategorySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  dappIds: z.array(z.string()).optional(),
  showOnEarnPage: z.boolean().optional(),
  multiplier: z.boolean().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;
export type UpdateActivityCategory = z.infer<
  typeof UpdateActivityCategorySchema
>;

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
        listForEarnPage: Effect.fn(function* () {
          const earnPageCategories = yield* Effect.tryPromise({
            try: () =>
              db.query.activityCategories.findMany({
                where: eq(activityCategories.showOnEarnPage, true),
              }),
            catch: (error) => new DbError(error),
          });
          return earnPageCategories as ActivityCategory[];
        }),
        getById: Effect.fn(function* (id: string) {
          const category = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  id: activityCategories.id,
                  name: activityCategories.name,
                  description: activityCategories.description,
                  dappIds: activityCategories.dappIds,
                  showOnEarnPage: activityCategories.showOnEarnPage,
                  multiplier: activityCategories.multiplier,
                  icon: activityCategories.icon,
                  color: activityCategories.color,
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
        update: Effect.fn(function* (
          id: string,
          updates: UpdateActivityCategory,
        ) {
          yield* Effect.tryPromise({
            try: () =>
              db
                .update(activityCategories)
                .set(updates)
                .where(eq(activityCategories.id, id)),
            catch: (error) => new DbError(error),
          });

          // Get the updated category by calling the method directly
          const category = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  id: activityCategories.id,
                  name: activityCategories.name,
                  description: activityCategories.description,
                  dappIds: activityCategories.dappIds,
                  showOnEarnPage: activityCategories.showOnEarnPage,
                  multiplier: activityCategories.multiplier,
                  icon: activityCategories.icon,
                  color: activityCategories.color,
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

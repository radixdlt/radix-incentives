import { activityCategories, dapps } from 'db/incentives';
import { eq, inArray } from 'drizzle-orm';
import { Data, Effect } from 'effect';
import { z } from 'zod';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

export const ActivityCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  multiplier: z.boolean(),
  dappIds: z.array(z.string()),
  showOnEarnPage: z.boolean(),
  dapps: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        website: z.string(),
        logoFileName: z.string().nullable(),
      }),
    )
    .optional(),
});

export const CreateActivityCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  multiplier: z.boolean().default(false),
  dappIds: z.array(z.string()).default([]),
  showOnEarnPage: z.boolean().default(true),
});

export const UpdateActivityCategorySchema = CreateActivityCategorySchema;

export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;
export type CreateActivityCategory = z.infer<
  typeof CreateActivityCategorySchema
>;
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
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        list: Effect.fn(function* () {
          const categories = yield* Effect.tryPromise({
            try: async () => {
              const categoriesData = await db.select().from(activityCategories);

              const categoriesWithDapps = await Promise.all(
                categoriesData.map(async (category) => {
                  const dappIds = (category.dappIds as string[]) || [];
                  let relatedDapps = [];

                  if (dappIds.length > 0) {
                    relatedDapps = await db
                      .select()
                      .from(dapps)
                      .where(inArray(dapps.id, dappIds));
                  }

                  return {
                    id: category.id,
                    name: category.name,
                    description: category.description,
                    multiplier: category.multiplier || false,
                    dappIds,
                    showOnEarnPage: category.showOnEarnPage || true,
                    dapps: relatedDapps,
                  };
                }),
              );

              return categoriesWithDapps;
            },
            catch: (error) => new DbError(error),
          });
          return categories as ActivityCategory[];
        }),
        getById: Effect.fn(function* (id: string) {
          const category = yield* Effect.tryPromise({
            try: async () => {
              const categoryData = await db
                .select()
                .from(activityCategories)
                .where(eq(activityCategories.id, id))
                .limit(1)
                .then((result) => result[0]);

              if (!categoryData) return null;

              const dappIds = (categoryData.dappIds as string[]) || [];
              let relatedDapps = [];

              if (dappIds.length > 0) {
                relatedDapps = await db
                  .select()
                  .from(dapps)
                  .where(inArray(dapps.id, dappIds));
              }

              return {
                id: categoryData.id,
                name: categoryData.name,
                description: categoryData.description,
                multiplier: categoryData.multiplier || false,
                dappIds,
                showOnEarnPage: categoryData.showOnEarnPage || true,
                dapps: relatedDapps,
              };
            },
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
        create: Effect.fn(function* (input: CreateActivityCategory) {
          const category = yield* Effect.tryPromise({
            try: () =>
              db
                .insert(activityCategories)
                .values({
                  id: input.id,
                  name: input.name,
                  description: input.description,
                  multiplier: input.multiplier,
                  dappIds: input.dappIds,
                  showOnEarnPage: input.showOnEarnPage,
                })
                .returning()
                .then((result) => result[0]),
            catch: (error) => new DbError(error),
          });

          return category;
        }),
        update: Effect.fn(function* (input: UpdateActivityCategory) {
          const category = yield* Effect.tryPromise({
            try: () =>
              db
                .update(activityCategories)
                .set({
                  name: input.name,
                  description: input.description,
                  multiplier: input.multiplier,
                  dappIds: input.dappIds,
                  showOnEarnPage: input.showOnEarnPage,
                })
                .where(eq(activityCategories.id, input.id))
                .returning()
                .then((result) => result[0]),
            catch: (error) => new DbError(error),
          });

          if (!category) {
            return yield* Effect.fail(
              new ActivityCategoryNotFoundError({
                message: `Activity category ${input.id} not found`,
              }),
            );
          }

          return category;
        }),
        delete: Effect.fn(function* (id: string) {
          const deletedCategory = yield* Effect.tryPromise({
            try: () =>
              db
                .delete(activityCategories)
                .where(eq(activityCategories.id, id))
                .returning()
                .then((result) => result[0]),
            catch: (error) => new DbError(error),
          });

          if (!deletedCategory) {
            return yield* Effect.fail(
              new ActivityCategoryNotFoundError({
                message: `Activity category ${id} not found`,
              }),
            );
          }

          return deletedCategory;
        }),
      };
    }),
  },
) {}

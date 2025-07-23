import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { z } from "zod";

export const ActivityCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;

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
      };
    }),
  }
) {}

import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

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
          return activityCategories;
        }),
      };
    }),
  }
) {}

import { Effect, Cache, Duration } from "effect";
import { groupBy } from "effect/Array";
import { DbClientService, DbError } from "../db/dbClient";
import type { Activity } from "./activity";

export class ActivityDataService extends Effect.Service<ActivityDataService>()(
  "ActivityDataService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      const getActivities = () =>
        Effect.tryPromise({
          try: () =>
            db.query.activities
              .findMany({
                with: {
                  activityCategories: true,
                },
              })
              .then((activities) => activities as Activity[]),
          catch: (error) => new DbError(error),
        });

      const activityCache = yield* Cache.make({
        capacity: 1000,
        timeToLive: Duration.hours(1),
        lookup: (_: string) =>
          Effect.gen(function* () {
            const activities = yield* getActivities();

            const groupedById = groupBy(activities, (item) => item.id);
            const groupedByCategory = groupBy(
              activities,
              (item) => item.category
            );

            return {
              list: activities,
              groupedById,
              groupedByCategory,
            };
          }),
      });
      return {
        list: Effect.fn(function* () {
          return yield* activityCache.get("list");
        }),
      };
    }),
  }
) {}

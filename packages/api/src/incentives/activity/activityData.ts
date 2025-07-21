import { Effect, Cache, Duration } from "effect";
import { groupBy } from "effect/Array";
import { DbClientService, DbError } from "../db/dbClient";
import { defaultActivitiesData } from "data";

const defaultGroupedById = groupBy(defaultActivitiesData, (item) => item.id);

export class ActivityDataService extends Effect.Service<ActivityDataService>()(
  "ActivityDataService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      const getActivities = () =>
        Effect.tryPromise({
          try: () =>
            db.query.activities.findMany({
              with: {
                activityCategories: true,
              },
            }),
          catch: (error) => new DbError(error),
        });

      const activityCache = yield* Cache.make({
        capacity: 1000,
        timeToLive: Duration.hours(1),
        lookup: (_: string) =>
          Effect.gen(function* () {
            const activities = yield* getActivities();

            const withDefaultData = activities
              .map((item) => {
                const withDefault = defaultGroupedById[item.id]?.[0] || {};
                return {
                  ...item,
                  ...withDefault,
                };
              })
              // @ts-ignore - hide is not in the type
              .filter((item) => !item?.hide);

            const groupedById = groupBy(withDefaultData, (item) => item.id);
            const groupedByCategory = groupBy(
              withDefaultData,
              (item) => item.category
            );

            return {
              list: withDefaultData,
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

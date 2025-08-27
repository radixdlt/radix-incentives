import { Effect } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';
import type { Activity } from './activity';

export class ActivityDataService extends Effect.Service<ActivityDataService>()(
  'ActivityDataService',
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
              .then((activities) => activities as Activity[])
              .then((activities) =>
                activities.map((item) => ({
                  ...item,
                  description:
                    item.description === 'NULL' ? undefined : item.description,
                  name: item.name === 'NULL' ? undefined : item.name,
                })),
              ),
          catch: (error) => new DbError(error),
        });

      return {
        list: Effect.fn(function* () {
          const activities = yield* getActivities();

          return activities;
        }),
      };
    }),
  },
) {}

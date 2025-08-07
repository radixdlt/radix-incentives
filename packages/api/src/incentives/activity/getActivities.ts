import { type Activity, activities } from 'db/incentives';
import { Context, Effect, Layer } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';

export class GetActivitiesService extends Context.Tag('GetActivitiesService')<
  GetActivitiesService,
  () => Effect.Effect<Activity[], DbError>
>() {}

export const GetActivitiesLive = Layer.effect(
  GetActivitiesService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return () =>
      Effect.tryPromise({
        try: () => db.select().from(activities),
        catch: (error) => new DbError(error),
      }).pipe(Effect.map((activities) => activities as Activity[]));
  }),
);

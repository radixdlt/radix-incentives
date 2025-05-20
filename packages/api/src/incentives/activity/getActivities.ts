import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { activities, type Activity } from "db/incentives";

export class GetActivitiesService extends Context.Tag("GetActivitiesService")<
  GetActivitiesService,
  () => Effect.Effect<Activity[], DbError, DbClientService>
>() {}

export const GetActivitiesLive = Layer.effect(
  GetActivitiesService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return () =>
      Effect.tryPromise({
        try: () => db.select().from(activities),
        catch: (error) => new DbError(error),
      });
  })
);

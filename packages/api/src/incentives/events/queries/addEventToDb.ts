import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../../db/dbClient";

import { events, type Event } from "db/incentives";
import SuperJSON from "superjson";

export class AddEventsToDbService extends Context.Tag("AddEventsToDbService")<
  AddEventsToDbService,
  (input: Event[]) => Effect.Effect<Event[], DbError>
>() {}

export const AddEventsToDbLive = Layer.effect(
  AddEventsToDbService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .insert(events)
              .values(
                input.map((item) => ({
                  ...item,
                  eventData: SuperJSON.serialize(item.eventData),
                }))
              )
              .returning()
              .onConflictDoNothing(),
          catch: (error) => new DbError(error),
        });

        return result;
      });
    };
  })
);

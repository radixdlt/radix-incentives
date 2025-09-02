import { type Event, events } from 'db/incentives';
import { Effect } from 'effect';
import SuperJSON from 'superjson';
import { DbClientService, DbError, dbClientLive } from '../../db/dbClient';

export class AddEventsToDbService extends Effect.Service<AddEventsToDbService>()(
  'AddEventsToDbService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      return Effect.fn(function* (input: Event[]) {
        // Implementation goes here
        return yield* Effect.tryPromise({
          try: () =>
            db
              .insert(events)
              .values(
                input.map((item) => ({
                  ...item,
                  eventData: SuperJSON.serialize(item.eventData),
                })),
              )
              .returning()
              .onConflictDoNothing(),
          catch: (error) => new DbError(error),
        });
      });
    }),
  },
) {}

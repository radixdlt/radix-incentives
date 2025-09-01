import { type Event, events } from 'db/incentives';
import { Effect } from 'effect';
import SuperJSON from 'superjson';
import { DbService } from '../../db/dbClient';

export class AddEventsToDbService extends Effect.Service<AddEventsToDbService>()(
  'AddEventsToDbService',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;

      return Effect.fn(function* (input: Event[]) {
        // Implementation goes here
        return yield* db
          .insert(events)
          .values(
            input.map((item) => ({
              ...item,
              eventData: SuperJSON.serialize(item.eventData),
            })),
          )
          .returning()
          .onConflictDoNothing();
      });
    }),
  },
) {}

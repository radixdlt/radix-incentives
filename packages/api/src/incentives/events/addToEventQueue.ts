import { Effect } from 'effect';
import {
  type EventQueueClientInput,
  EventQueueClientService,
} from './eventQueueClient';

type AddToEventQueueInput = EventQueueClientInput;

export class AddToEventQueueService extends Effect.Service<AddToEventQueueService>()(
  'AddToEventQueueService',
  {
    dependencies: [EventQueueClientService.Default],
    effect: Effect.gen(function* () {
      const eventQueueClientService = yield* EventQueueClientService;
      return Effect.fn(function* (input: AddToEventQueueInput) {
        // Implementation goes here
        yield* eventQueueClientService(input);
      });
    }),
  },
) {}

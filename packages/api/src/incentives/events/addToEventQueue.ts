import { Effect } from 'effect';
import {
  type EventQueueClientInput,
  EventQueueClientService,
} from './eventQueueClient';

type AddToEventQueueInput = EventQueueClientInput;

export class AddToEventQueueService extends Effect.Service<AddToEventQueueService>()(
  'AddToEventQueueService',
  {
    effect: Effect.gen(function* () {
      const eventQueueClientService = yield* EventQueueClientService;
      return Effect.fn(function* (input: AddToEventQueueInput) {
        return yield* eventQueueClientService(input);
      });
    }),
  },
) {}

export const AddToEventQueueLive = AddToEventQueueService.Default;

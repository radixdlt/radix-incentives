import { Config, Effect } from 'effect';
import { z } from 'zod';
import { FetchService } from '../../common';

export class AddToEventQueueError {
  _tag = 'AddToEventQueueError';
  constructor(readonly message: unknown) {}
}

export class AddToEventQueueInputSchemaError {
  _tag = 'AddToEventQueueInputSchemaError';
  constructor(readonly message: z.ZodError<EventQueueClientInput>) {}
}

export const EventQueueClientServiceSchema = z.array(
  z.object({
    transactionId: z.string(),
    eventIndex: z.number(),
  }),
);

export type EventQueueClientInput = z.infer<
  typeof EventQueueClientServiceSchema
>;

export type EventQueueClientServiceError =
  | AddToEventQueueError
  | AddToEventQueueInputSchemaError;

export class EventQueueClientService extends Effect.Service<EventQueueClientService>()(
  'EventQueueClientService',
  {
    effect: Effect.gen(function* () {
      const workersApiBaseUrl = yield* Config.string('WORKERS_API_BASE_URL');
      const fetchImp = yield* Effect.provide(
        FetchService,
        FetchService.Default,
      );

      return Effect.fn(function* (input: EventQueueClientInput) {
        const parsedInput = EventQueueClientServiceSchema.safeParse(input);

        if (!parsedInput.success) {
          return yield* Effect.dieMessage(parsedInput.error.message);
        }

        const response = yield* Effect.tryPromise({
          try: () =>
            fetchImp(`${workersApiBaseUrl}/queues/event/add`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(input),
            }),
          catch: (error) => new AddToEventQueueError(error),
        });

        if (response.status !== 200) {
          return yield* Effect.fail(
            new AddToEventQueueError(
              `Failed to add to event queue, got status: ${response.status} ${response.statusText}`,
            ),
          );
        }
      });
    }),
  },
) {}

export const EventQueueClientLive = EventQueueClientService.Default;

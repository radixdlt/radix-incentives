import { Effect, Layer } from "effect";
import { Context } from "effect";
import { z } from "zod";

export class AddToEventQueueError {
  _tag = "AddToEventQueueError";
  constructor(readonly message: unknown) {}
}

export class AddToEventQueueInputSchemaError {
  _tag = "AddToEventQueueInputSchemaError";
  constructor(readonly message: z.ZodError<EventQueueClientInput>) {}
}

export const EventQueueClientServiceSchema = z.array(
  z.object({
    transactionId: z.string(),
    eventIndex: z.number(),
  })
);

export type EventQueueClientInput = z.infer<
  typeof EventQueueClientServiceSchema
>;

export type EventQueueClientServiceError =
  | AddToEventQueueError
  | AddToEventQueueInputSchemaError;

export class EventQueueClientService extends Context.Tag(
  "EventQueueClientService"
)<
  EventQueueClientService,
  (
    input: EventQueueClientInput
  ) => Effect.Effect<void, EventQueueClientServiceError, never>
>() {}

export const EventQueueClientLive = Layer.effect(
  EventQueueClientService,
  Effect.gen(function* () {
    const workersApiBaseUrl = process.env.WORKERS_API_BASE_URL;

    if (!workersApiBaseUrl) {
      return yield* Effect.dieMessage("WORKERS_API_BASE_URL is not set");
    }

    return (input) =>
      Effect.gen(function* () {
        const parsedInput = EventQueueClientServiceSchema.safeParse(input);

        if (!parsedInput.success) {
          return yield* Effect.dieMessage(parsedInput.error.message);
        }

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${workersApiBaseUrl}/queues/event/add`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(input),
            }),
          catch: (error) => new AddToEventQueueError(error),
        });

        if (response.status !== 200) {
          return yield* Effect.fail(
            new AddToEventQueueError(
              `Failed to add to event queue, got status: ${response.status} ${response.statusText}`
            )
          );
        }
      });
  })
);

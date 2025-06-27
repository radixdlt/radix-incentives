import { Effect, Layer } from "effect";
import { Context } from "effect";
import {
  EventQueueClientService,
  type EventQueueClientInput,
  type EventQueueClientServiceError,
} from "./eventQueueClient";

type AddToEventQueueInput = EventQueueClientInput;

export class AddToEventQueueService extends Context.Tag(
  "AddToEventQueueService"
)<
  AddToEventQueueService,
  (
    input: AddToEventQueueInput
  ) => Effect.Effect<void, EventQueueClientServiceError>
>() {}

export const AddToEventQueueLive = Layer.effect(
  AddToEventQueueService,
  Effect.gen(function* () {
    const eventQueueClientService = yield* EventQueueClientService;

    return (input) =>
      Effect.gen(function* () {
        yield* eventQueueClientService(input);
      });
  })
);

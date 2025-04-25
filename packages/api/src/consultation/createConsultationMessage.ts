import { Context, Effect, Layer } from "effect";
import { createConsultationMessageHash } from "./createConsultationHash";

export class CreateConsultationMessageError {
  readonly _tag = "CreateConsultationMessageError";
  constructor(readonly error: unknown) {}
}

export class CreateConsultationMessageService extends Context.Tag(
  "CreateConsultationMessageService"
)<
  CreateConsultationMessageService,
  (input: {
    consultationId: string;
    selectedOption: string;
  }) => Effect.Effect<
    Uint8Array<ArrayBufferLike>,
    CreateConsultationMessageError
  >
>() {}

export const CreateConsultationMessageLive = Layer.effect(
  CreateConsultationMessageService,
  Effect.gen(function* () {
    return (input) =>
      Effect.gen(function* () {
        return yield* Effect.tryPromise({
          try: () => createConsultationMessageHash(input),
          catch: (error) => new CreateConsultationMessageError(error),
        });
      });
  })
);

import { Effect } from "effect";
import { createConsultationMessageHash } from "./createConsultationHash";

export class CreateConsultationMessageError {
  readonly _tag = "CreateConsultationMessageError";
  constructor(readonly error: unknown) {}
}

export class CreateConsultationMessageService extends Effect.Service<CreateConsultationMessageService>()(
  "CreateConsultationMessageService",
  {
    effect: Effect.gen(function* () {
      return {
        run: Effect.fn(function* (input: {
          consultationId: string;
          selectedOption: string;
        }) {
          return yield* Effect.tryPromise({
            try: () => createConsultationMessageHash(input),
            catch: (error) => new CreateConsultationMessageError(error),
          });
        }),
      };
    }),
  }
) {}

import { Effect } from "effect";
import { z } from "zod";

export const StateVersionSchema = z.object({
  state_version: z.number(),
});
export const TimestampSchema = z.object({
  timestamp: z.date(),
});

export const StateSchema = z.union([StateVersionSchema, TimestampSchema]);

export type State = z.infer<typeof StateSchema>;

export class InvalidStateInputError {
  readonly _tag = "InvalidStateInputError";
  constructor(readonly error: z.ZodError<State>) {}
}

export const validateStateInput = (
  input: unknown
): Effect.Effect<State, InvalidStateInputError> =>
  Effect.gen(function* () {
    const parsed = StateSchema.safeParse(input);
    if (!parsed.success) {
      return yield* Effect.fail(new InvalidStateInputError(parsed.error));
    }
    return parsed.data;
  });

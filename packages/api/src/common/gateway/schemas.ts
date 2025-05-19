import { z } from "zod";
import { Effect } from "effect";

export const StateVersionSchema = z.object({
  state_version: z.number(),
});

export const TimestampSchema = z.object({
  timestamp: z.date(),
});

export const AtLedgerStateSchema = z.union([
  StateVersionSchema,
  TimestampSchema,
]);

export type AtLedgerState = z.infer<typeof AtLedgerStateSchema>;

export class InvalidStateInputError {
  readonly _tag = "InvalidStateInputError";
  constructor(readonly error: z.ZodError<AtLedgerState>) {}
}

export const validateAtLedgerStateInput = (
  input: unknown
): Effect.Effect<AtLedgerState, InvalidStateInputError> =>
  Effect.gen(function* () {
    const parsed = AtLedgerStateSchema.safeParse(input);
    if (!parsed.success) {
      return yield* Effect.fail(new InvalidStateInputError(parsed.error));
    }
    return parsed.data;
  });

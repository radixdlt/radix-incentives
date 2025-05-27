import { Context, Effect, Layer } from "effect";

import { z } from "zod";
import { RolaService } from "./rola";

import type { UnknownException } from "effect/Cause";

export const signedChallengeSchema = z.object({
  challenge: z.string(),
  items: z.array(
    z.object({
      type: z.enum(["persona", "account"]),
      address: z.string(),
      label: z.string(),
      proof: z.object({
        publicKey: z.string(),
        signature: z.string(),
        curve: z.enum(["curve25519", "secp256k1"]),
      }),
    })
  ),
});

export type VerifyRolaProofInput = z.infer<typeof signedChallengeSchema>;

export class ParseRolaProofInputError {
  readonly _tag: "ParseRolaProofInputError";
  constructor(readonly error: z.ZodError<VerifyRolaProofInput>) {
    this._tag = "ParseRolaProofInputError";
  }
}

export class VerifyRolaProofError {
  readonly _tag: "VerifyRolaProofError";
  constructor(readonly error: unknown) {
    this._tag = "VerifyRolaProofError";
  }
}

export class VerifyRolaProofService extends Context.Tag(
  "VerifyRolaProofService"
)<
  VerifyRolaProofService,
  (
    input: VerifyRolaProofInput
  ) => Effect.Effect<
    boolean,
    ParseRolaProofInputError | VerifyRolaProofError | UnknownException,
    RolaService
  >
>() {}

export const VerifyRolaProofLive = Layer.effect(
  VerifyRolaProofService,
  Effect.gen(function* () {
    const verifySignedChallenge = yield* RolaService;

    return (input) =>
      Effect.gen(function* () {
        const verifyInputResult = yield* Effect.tryPromise(() =>
          signedChallengeSchema.safeParseAsync(input)
        );

        if (verifyInputResult.error) {
          yield* Effect.logError(
            {
              input,
              error: verifyInputResult.error,
            },
            "invalid input"
          );

          return yield* Effect.fail(
            new ParseRolaProofInputError(verifyInputResult.error)
          );
        }

        const signedChallenge = verifyInputResult.data;

        const items = signedChallenge.items
          .map((item) => ({
            ...item,
            challenge: signedChallenge.challenge,
          }))
          .map((item) => Effect.tryPromise(() => verifySignedChallenge(item)));

        const result = yield* Effect.all(items);

        const errors = result
          .filter((item) => item.isErr())
          .map((item) => item.error);

        if (errors.length > 0) {
          yield* Effect.logError(
            {
              input,
              errors,
            },
            "verifySignedChallenge failed"
          );

          return yield* Effect.fail(new VerifyRolaProofError(errors));
        }

        return true;
      });
  })
);

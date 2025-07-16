import { Effect } from "effect";

import { z } from "zod";
import { RolaService } from "./rola";

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

export class VerifyRolaProofService extends Effect.Service<VerifyRolaProofService>()(
  "VerifyRolaProofService",
  {
    effect: Effect.gen(function* () {
      const verifySignedChallenge = yield* RolaService;
      return {
        run: Effect.fn(function* (input: VerifyRolaProofInput) {
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

          yield* Effect.forEach(
            signedChallenge.items,
            Effect.fn(function* (item) {
              const result = yield* verifySignedChallenge.run({
                ...item,
                challenge: signedChallenge.challenge,
              });

              if (result.isErr()) {
                yield* Effect.logError(
                  {
                    input: {
                      ...item,
                      challenge: signedChallenge.challenge,
                    },
                    error: result.error,
                  },
                  "verifySignedChallenge failed"
                );

                return yield* Effect.fail(
                  new VerifyRolaProofError([result.error])
                );
              }

              return result.value;
            })
          );

          return true;
        }),
      };
    }),
  }
) {}

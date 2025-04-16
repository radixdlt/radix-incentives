import { Context, Effect, Layer } from "effect";
import type { SignedChallenge } from "@radixdlt/rola";
import { z } from "zod";
import { RolaService } from "../../effect/services/rola";
import { LoggerService } from "../../effect/services/logger";
import type { UnknownException } from "effect/Cause";

export const signedPersonaChallengeSchema = z.object({
  address: z.string(),
  type: z.enum(["persona"]),
  label: z.string(),
  challenge: z.string(),
  proof: z.object({
    publicKey: z.string(),
    signature: z.string(),
    curve: z.enum(["curve25519", "secp256k1"]),
  }),
});

export type VerifyRolaProofInput = z.infer<typeof signedPersonaChallengeSchema>;

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
    input: SignedChallenge
  ) => Effect.Effect<
    boolean,
    ParseRolaProofInputError | VerifyRolaProofError | UnknownException,
    RolaService | LoggerService
  >
>() {}

export const VerifyRolaProofLive = Layer.effect(
  VerifyRolaProofService,
  Effect.gen(function* () {
    const logger = yield* LoggerService;
    const verifySignedChallenge = yield* RolaService;

    return (input) =>
      Effect.gen(function* () {
        const verifyInputResult = yield* Effect.tryPromise(() =>
          signedPersonaChallengeSchema.safeParseAsync(input)
        );

        if (verifyInputResult.error) {
          logger.error(
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

        const result = yield* Effect.tryPromise(() =>
          verifySignedChallenge(signedChallenge)
        );

        if (result.isErr()) {
          logger.error(
            {
              input,
              error: result.error,
            },
            "verifySignedChallenge failed"
          );

          return yield* Effect.fail(new VerifyRolaProofError(result.error));
        }

        return true;
      });
  })
);

import { Effect } from "effect";
import { VerifyRolaProofService } from "../rola/verifyRolaProof";

import { VerifyChallengeService } from "../challenge/verifyChallenge";
import { UpsertUserService } from "../user/upsertUser";
import { CreateSessionService } from "../session/createSession";
import { GenerateSessionTokenService } from "../session/generateSessionToken";
import { z } from "zod";

export class InvalidChallengeError {
  readonly _tag = "InvalidChallengeError";
}

export class InvalidProofError {
  readonly _tag = "InvalidProofError";
}

export const signInWithRolaProofInputSchema = z.object({
  challenge: z.string(),
  type: z.enum(["persona"]),
  address: z.string(),
  label: z.string(),
  proof: z.object({
    publicKey: z.string(),
    signature: z.string(),
    curve: z.enum(["curve25519", "secp256k1"]),
  }),
});

export type SignInWithRolaProofInput = z.infer<
  typeof signInWithRolaProofInputSchema
>;

export const signInWithRolaProof = (input: SignInWithRolaProofInput) =>
  Effect.gen(function* () {
    const verifyChallenge = yield* VerifyChallengeService;
    const verifyProof = yield* VerifyRolaProofService;
    const upsertUser = yield* UpsertUserService;
    const generateSessionToken = yield* GenerateSessionTokenService;
    const createSession = yield* CreateSessionService;

    const isValidChallenge = yield* verifyChallenge(input.challenge);

    if (!isValidChallenge)
      return yield* Effect.fail(new InvalidChallengeError());

    const isValidProof = yield* verifyProof({
      challenge: input.challenge,
      items: [input],
    });

    if (!isValidProof) return yield* Effect.fail(new InvalidProofError());

    const { id: userId } = yield* upsertUser({
      address: input.address,
      label: input.label,
    });

    const token = generateSessionToken();

    const session = yield* createSession({
      token,
      userId,
    });

    return { session, token };
  });

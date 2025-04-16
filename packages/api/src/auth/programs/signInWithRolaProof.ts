import { Effect } from "effect";
import { VerifyRolaProofService } from "../rola/verifyRolaProof";

import type { VerifyRolaProofInput } from "../rola/verifyRolaProof";
import { VerifyChallengeService } from "../challenge/verifyChallenge";
import { UpsertUserService } from "../user/upsertUser";
import { CreateSessionService } from "../session/createSession";
import { GenerateSessionTokenService } from "../session/generateSessionToken";

export class InvalidChallengeError {
  readonly _tag = "InvalidChallengeError";
}

export class InvalidProofError {
  readonly _tag = "InvalidProofError";
}

export class InvalidProofTypeError {
  readonly _tag = "InvalidProofTypeError";
  constructor(readonly proofType: string) {
    this._tag = "InvalidProofTypeError";
  }
}

export const signInWithRolaProof = (input: VerifyRolaProofInput) =>
  Effect.gen(function* () {
    if (input.type !== "persona") {
      return yield* Effect.fail(
        new InvalidProofTypeError(
          `expected proof type persona, got ${input.type}`
        )
      );
    }

    const verifyChallenge = yield* VerifyChallengeService;
    const verifyProof = yield* VerifyRolaProofService;
    const upsertUser = yield* UpsertUserService;
    const generateSessionToken = yield* GenerateSessionTokenService;
    const createSession = yield* CreateSessionService;

    const isValidChallenge = yield* verifyChallenge(input.challenge);

    if (!isValidChallenge)
      return yield* Effect.fail(new InvalidChallengeError());

    const isValidProof = yield* verifyProof(input);

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

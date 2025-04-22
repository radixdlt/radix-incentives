import { Effect } from "effect";
import { VerifyRolaProofService } from "../rola/verifyRolaProof";

import { VerifyChallengeService } from "../challenge/verifyChallenge";
import { z } from "zod";
import { UpsertAccountsService } from "../account/upsertAccounts";

export class InvalidChallengeError {
  readonly _tag = "InvalidChallengeError";
}

export class InvalidProofError {
  readonly _tag = "InvalidProofError";
}

export const verifyAccountOwnershipInputSchema = z.object({
  userId: z.string(),
  challenge: z.string(),
  items: z.array(
    z.object({
      type: z.enum(["account"]),
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

export type VerifyAccountOwnershipInput = z.infer<
  typeof verifyAccountOwnershipInputSchema
>;

export const verifyAccountOwnershipProgram = (
  input: VerifyAccountOwnershipInput
) =>
  Effect.gen(function* () {
    const verifyChallenge = yield* VerifyChallengeService;
    const verifyProof = yield* VerifyRolaProofService;
    const upsertAccounts = yield* UpsertAccountsService;

    const isValidChallenge = yield* verifyChallenge(input.challenge);

    if (!isValidChallenge)
      return yield* Effect.fail(new InvalidChallengeError());

    const isValidProof = yield* verifyProof({
      challenge: input.challenge,
      items: input.items,
    });

    if (!isValidProof) return yield* Effect.fail(new InvalidProofError());

    const accounts = yield* upsertAccounts({
      userId: input.userId,
      accounts: input.items,
    });

    return accounts;
  });

import { Effect } from 'effect';
import { z } from 'zod';
import { VerifyChallengeService } from '../challenge/verifyChallenge';
import { VerifyRolaProofService } from '../rola/verifyRolaProof';
import { CreateSessionService } from '../session/createSession';
import { GenerateSessionTokenService } from '../session/generateSessionToken';
import { UpsertUserService } from '../user/upsertUser';

export class InvalidChallengeError {
  readonly _tag = 'InvalidChallengeError';
}

export class InvalidProofError {
  readonly _tag = 'InvalidProofError';
}

export const signInWithRolaProofInputSchema = z.object({
  rolaProof: z.object({
    challenge: z.string(),
    type: z.enum(['persona']),
    address: z.string(),
    label: z.string(),
    proof: z.object({
      publicKey: z.string(),
      signature: z.string(),
      curve: z.enum(['curve25519', 'secp256k1']),
    }),
  }),
  referralCode: z.string().optional(),
});

export type SignInWithRolaProofInput = z.infer<
  typeof signInWithRolaProofInputSchema
>;

export class SignInWithRolaProofService extends Effect.Service<SignInWithRolaProofService>()(
  'SignInWithRolaProofService',
  {
    dependencies: [
      VerifyRolaProofService.Default,
      UpsertUserService.Default,
      GenerateSessionTokenService.Default,
      CreateSessionService.Default,
    ],

    effect: Effect.gen(function* () {
      const verifyChallenge = yield* VerifyChallengeService;
      const verifyProof = yield* VerifyRolaProofService;
      const upsertUser = yield* UpsertUserService;
      const generateSessionToken = yield* GenerateSessionTokenService;
      const createSession = yield* CreateSessionService;

      return Effect.fnUntraced(function* (input: SignInWithRolaProofInput) {
        const isValidChallenge = yield* verifyChallenge(
          input.rolaProof.challenge,
        );

        if (!isValidChallenge)
          return yield* Effect.fail(new InvalidChallengeError());

        const isValidProof = yield* verifyProof({
          challenge: input.rolaProof.challenge,
          items: [input.rolaProof],
        });

        if (!isValidProof) return yield* Effect.fail(new InvalidProofError());

        const { id: userId } = yield* upsertUser({
          address: input.rolaProof.address,
          label: input.rolaProof.label,
          referralCode: input.referralCode,
        });

        const token = yield* generateSessionToken();

        const session = yield* createSession({
          token,
          userId,
        });

        return { session, token };
      });
    }),
  },
) {}

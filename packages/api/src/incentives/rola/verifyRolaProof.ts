import { Data, Effect, Schema } from 'effect';

import { z } from 'zod';
import { AccountProofSchema } from '../auth/schemas';
import { HexString } from '../schemas/brandedTypes';
import { RolaService } from './rola';

export const signedChallengeSchema = z.object({
  challenge: z.string(),
  items: z.array(
    z.object({
      type: z.enum(['persona', 'account']),
      address: z.string(),
      label: z.string(),
      proof: z.object({
        publicKey: z.string(),
        signature: z.string(),
        curve: z.enum(['curve25519', 'secp256k1']),
      }),
    }),
  ),
});

export type VerifyRolaProofInput = z.infer<typeof signedChallengeSchema>;

export class ParseRolaProofInputError extends Data.TaggedError(
  'ParseRolaProofInputError',
)<{ error: z.ZodError<VerifyRolaProofInput> }> {}

export const VerifyAccountProofInputSchema = Schema.Struct({
  challenge: HexString,
  proof: AccountProofSchema,
});

export type VerifyAccountProofInput = typeof VerifyAccountProofInputSchema.Type;

export class VerifyRolaProofService extends Effect.Service<VerifyRolaProofService>()(
  'VerifyRolaProofService',
  {
    dependencies: [RolaService.Default],
    effect: Effect.gen(function* () {
      const verifySignedChallenge = yield* RolaService;

      return {
        verifyProofs: Effect.fnUntraced(function* (
          input: VerifyRolaProofInput,
        ) {
          const verifyInputResult = yield* Effect.tryPromise(() =>
            signedChallengeSchema.safeParseAsync(input),
          );

          if (verifyInputResult.error) {
            yield* Effect.logError(
              {
                input,
                error: verifyInputResult.error,
              },
              'invalid input',
            );

            return yield* Effect.fail(
              new ParseRolaProofInputError({ error: verifyInputResult.error }),
            );
          }

          const signedChallenge = verifyInputResult.data;

          yield* Effect.forEach(
            signedChallenge.items,
            Effect.fnUntraced(function* (item) {
              yield* verifySignedChallenge({
                ...item,
                challenge: signedChallenge.challenge,
              });
            }),
            {
              concurrency: 'unbounded',
            },
          );

          return true;
        }),
        verifyAccountProof: (input: VerifyAccountProofInput) =>
          verifySignedChallenge({
            challenge: input.challenge,
            address: input.proof.address,
            type: 'account',
            proof: input.proof.proof,
          }),
      };
    }),
  },
) {}

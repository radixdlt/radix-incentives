import { Data, Effect } from 'effect';

import { z } from 'zod';
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

export class VerifyRolaProofService extends Effect.Service<VerifyRolaProofService>()(
  'VerifyRolaProofService',
  {
    dependencies: [RolaService.Default],
    effect: Effect.gen(function* () {
      const verifySignedChallenge = yield* RolaService;

      return Effect.fnUntraced(function* (input: VerifyRolaProofInput) {
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
      });
    }),
  },
) {}

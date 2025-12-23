import { Convert, RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import { Data, Effect, pipe } from 'effect';
import { HexString, TransactionId } from 'shared/brandedTypes';
import type { TransactionIntent } from './schemas';

class FailedToCreateIntentHashError extends Data.TaggedError(
  'FailedToCreateIntentHashError',
)<{
  error: unknown;
}> {}

export class IntentHashService extends Effect.Service<IntentHashService>()(
  'IntentHashService',
  {
    effect: Effect.gen(function* () {
      const createIntentHash = (input: TransactionIntent) =>
        Effect.tryPromise({
          try: () => RadixEngineToolkit.Intent.hash(input),
          catch: (error) => new FailedToCreateIntentHashError({ error }),
        }).pipe(
          Effect.map((hash) => ({
            id: TransactionId.make(hash.id),
            hash: pipe(
              Convert.Uint8Array.toHexString(hash.hash),
              HexString.make,
            ),
          })),
        );

      return { create: createIntentHash };
    }),
  },
) {}

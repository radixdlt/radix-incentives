import { RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';

import { Data, Effect } from 'effect';
import type { NetworkId, StringManifestDecoded } from './schemas';

class FailedToStaticallyValidateManifestError extends Data.TaggedError(
  'FailedToStaticallyValidateManifestError',
)<{
  cause: unknown;
}> {}

class InvalidManifestError extends Data.TaggedError('InvalidManifestError')<{
  cause: string;
}> {}

export class StaticallyValidateManifest extends Effect.Service<StaticallyValidateManifest>()(
  'StaticallyValidateManifest',
  {
    effect: Effect.gen(function* () {
      return (input: {
        manifest: StringManifestDecoded;
        networkId: NetworkId;
      }) =>
        Effect.gen(function* () {
          const result = yield* Effect.tryPromise({
            try: () =>
              RadixEngineToolkit.TransactionManifest.staticallyValidate(
                input.manifest,
                input.networkId,
              ),
            catch: (error) => {
              return new FailedToStaticallyValidateManifestError({
                cause: error,
              });
            },
          });
          if (result.kind === 'Invalid') {
            return yield* Effect.fail(
              new InvalidManifestError({
                cause: result.error,
              }),
            );
          }
        });
    }),
  },
) {}

import { PrivateKey } from '@radixdlt/radix-engine-toolkit';
import { Config, Effect, Redacted } from 'effect';

export class NotaryKeyPair extends Effect.Service<NotaryKeyPair>()(
  'NotaryKeyPair',
  {
    effect: Effect.gen(function* () {
      return {
        publicKey: Effect.fn(function* () {
          const notarizerPrivateKeyRedacted = yield* Config.redacted(
            'NOTARIZER_PRIVATE_KEY',
          ).pipe(Effect.orDie);
          const value = Redacted.value(notarizerPrivateKeyRedacted);
          return new PrivateKey.Ed25519(value).publicKey();
        }),
        signToSignature: Effect.fn(function* (
          hash: Uint8Array<ArrayBufferLike>,
        ) {
          const notarizerPrivateKeyRedacted = yield* Config.redacted(
            'NOTARIZER_PRIVATE_KEY',
          ).pipe(Effect.orDie);
          const value = Redacted.value(notarizerPrivateKeyRedacted);
          return new PrivateKey.Ed25519(value).signToSignature(hash);
        }),
      };
    }),
  },
) {}

import { Signature } from '@radixdlt/radix-engine-toolkit';
import { Array as A, Effect, flow, Option } from 'effect';
import type { HexString } from 'shared/brandedTypes';
import { Signer } from './signer/signer';

export class NotaryKeyPair extends Effect.Service<NotaryKeyPair>()(
  'NotaryKeyPair',
  {
    dependencies: [],
    effect: Effect.gen(function* () {
      const signer = yield* Signer;

      return {
        publicKey: () => signer.publicKey(),
        signToSignature: (hash: HexString) =>
          signer.signToSignatureWithPublicKey(hash).pipe(
            Effect.map(
              flow(
                A.head,
                Option.map(
                  (signature) => new Signature.Ed25519(signature.signature),
                ),
                Option.getOrThrow,
              ),
            ),
          ),
      };
    }),
  },
) {}

import { ed25519 } from '@noble/curves/ed25519';
import { PrivateKey, RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import { Effect } from 'effect';

export const createPersona = () =>
  Effect.gen(function* () {
    const privateKey = ed25519.utils.randomPrivateKey();

    const publicKey = ed25519.getPublicKey(privateKey);
    const publicKeyHex = Buffer.from(publicKey).toString('hex');

    const keypair = new PrivateKey.Ed25519(privateKey);

    const address = yield* Effect.tryPromise(() =>
      RadixEngineToolkit.Derive.virtualIdentityAddressFromPublicKey(
        keypair.publicKey(),
        1,
      ),
    );

    return {
      address,
      sign: (hash: string) => {
        const signature = ed25519.sign(hash, privateKey);
        return Buffer.from(signature).toString('hex');
      },
      publicKeyHex,
    };
  });

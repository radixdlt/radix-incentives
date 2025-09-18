import { ed25519 } from '@noble/curves/ed25519';
import { PrivateKey, RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import { Effect } from 'effect';

export const createAccount = (input?: Uint8Array) =>
  Effect.gen(function* () {
    const privateKey = input ? input : ed25519.utils.randomPrivateKey();

    const publicKey = ed25519.getPublicKey(privateKey);
    const publicKeyHex = Buffer.from(publicKey).toString('hex');

    const keypair = new PrivateKey.Ed25519(privateKey);

    const address = yield* Effect.tryPromise(() =>
      RadixEngineToolkit.Derive.virtualAccountAddressFromPublicKey(
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

import { ed25519 } from '@noble/curves/ed25519';
import { PrivateKey, RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import { Effect } from 'effect';
import { AccountAddress } from '../incentives/account-balance/v2/schemas';

export const createAccount = (
  input?: Partial<{
    privateKey: Uint8Array;
    networkId: number;
  }>,
) =>
  Effect.gen(function* () {
    const privateKey = input?.privateKey
      ? input.privateKey
      : ed25519.utils.randomPrivateKey();

    const publicKey = ed25519.getPublicKey(privateKey);
    const publicKeyHex = Buffer.from(publicKey).toString('hex');

    const keypair = new PrivateKey.Ed25519(privateKey);

    const address = yield* Effect.tryPromise(() =>
      RadixEngineToolkit.Derive.virtualAccountAddressFromPublicKey(
        keypair.publicKey(),
        input?.networkId ?? 1,
      ),
    );

    return {
      address: AccountAddress(address),
      sign: (hash: string) => {
        const signature = ed25519.sign(hash, privateKey);
        return Buffer.from(signature).toString('hex');
      },
      publicKeyHex,
      privateKeyHex: Buffer.from(privateKey).toString('hex'),
    };
  });

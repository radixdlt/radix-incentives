import { Convert } from '@radixdlt/radix-engine-toolkit';
import { Context, Data, Effect, Layer, Redacted, Schema } from 'effect';
import type { HexString } from '../../schemas/brandedTypes';
import {
  Ed25519PrivateKeySchema,
  type Ed25519SignatureWithPublicKey,
} from '../schemas';
import { Vault } from './vault';

export class FailedToSignTransactionError extends Data.TaggedError(
  'FailedToSignTransactionError',
)<{
  error: unknown;
}> {}

export class Signer extends Context.Tag('Signer')<
  Signer,
  (
    hash: HexString,
  ) => Effect.Effect<
    Ed25519SignatureWithPublicKey[],
    FailedToSignTransactionError,
    never
  >
>() {
  static VaultLive = Layer.effect(
    Signer,
    Effect.gen(function* () {
      const vault = yield* Vault;

      return (hash: HexString) =>
        vault.toSignatureWithPublicKey(hash).pipe(
          Effect.map((signatureWithPublicKey) => [signatureWithPublicKey]),
          Effect.catchAll(Effect.die),
        );
    }),
  ).pipe(Layer.provide(Vault.Default));
  static makePrivateKeySigner = (privateKey: Redacted.Redacted<HexString>) =>
    Layer.effect(
      Signer,
      Effect.gen(function* () {
        return (hash: HexString) =>
          Effect.gen(function* () {
            const value = Redacted.value(privateKey);
            const Ed25519PrivateKey = yield* Schema.decode(
              Ed25519PrivateKeySchema,
            )(value);
            const signatureWithPublicKey =
              Ed25519PrivateKey.signToSignatureWithPublicKey(
                Convert.HexString.toUint8Array(hash),
              );

            return [
              {
                curve: 'Ed25519' as const,
                signature: signatureWithPublicKey.signature,
                publicKey: Ed25519PrivateKey.publicKey().bytes,
              },
            ];
          }).pipe(
            Effect.orDie,
            Effect.annotateLogs({
              signer: 'PrivateKey',
            }),
          );
      }),
    );
}

import { Convert, PublicKey } from '@radixdlt/radix-engine-toolkit';
import { Context, Data, Effect, Layer, Redacted, Schema } from 'effect';
import type { HexString } from 'shared/brandedTypes';
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
  {
    signToSignatureWithPublicKey: (
      hash: HexString,
    ) => Effect.Effect<
      Ed25519SignatureWithPublicKey[],
      FailedToSignTransactionError,
      never
    >;
    publicKey: () => Effect.Effect<PublicKey, never, never>;
  }
>() {
  static VaultLive = Layer.effect(
    Signer,
    Effect.gen(function* () {
      const vault = yield* Vault;

      return {
        signToSignatureWithPublicKey: (hash: HexString) =>
          vault.toSignatureWithPublicKey(hash).pipe(
            Effect.map((signatureWithPublicKey) => [signatureWithPublicKey]),
            Effect.catchAll(Effect.die),
          ),
        publicKey: () =>
          vault
            .getPublicKey()
            .pipe(Effect.map((publicKey) => new PublicKey.Ed25519(publicKey))),
      };
    }),
  ).pipe(Layer.provide(Vault.Default));
  static makePrivateKeySigner = (privateKey: Redacted.Redacted<HexString>) =>
    Layer.effect(
      Signer,
      Effect.gen(function* () {
        return {
          signToSignatureWithPublicKey: (hash: HexString) =>
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
            ),
          publicKey: () =>
            Effect.gen(function* () {
              const value = Redacted.value(privateKey);
              const Ed25519PrivateKey = yield* Schema.decode(
                Ed25519PrivateKeySchema,
              )(value);
              return Ed25519PrivateKey.publicKey();
            }).pipe(Effect.orDie),
        };
      }),
    );
}

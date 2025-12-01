import {
  Convert,
  PrivateKey,
  PublicKey,
  SignatureWithPublicKey,
} from '@radixdlt/radix-engine-toolkit';
import { Effect, Option, Schema } from 'effect';

export const Epoch = Schema.Number.pipe(Schema.brand('Epoch'));
export type Epoch = typeof Epoch.Type;

export const NetworkId = Schema.Number.pipe(Schema.brand('NetworkId'));
export type NetworkId = typeof NetworkId.Type;

export const Nonce = Schema.Number.pipe(Schema.brand('Nonce'));
export type Nonce = typeof Nonce.Type;

export const HexString = Schema.String.pipe(Schema.brand('HexString'));
export type HexString = typeof HexString.Type;

export const TransactionId = Schema.String.pipe(Schema.brand('TransactionId'));
export type TransactionId = typeof TransactionId.Type;

export const TransactionManifestString = Schema.String.pipe(
  Schema.brand('TransactionManifestString'),
);
export type TransactionManifestString = typeof TransactionManifestString.Type;

export const TransactionMessageString = Schema.String.pipe(
  Schema.brand('TransactionMessageString'),
);
export type TransactionMessageString = typeof TransactionMessageString.Type;

export const Ed25519PublicKeySchema = Schema.asSchema(
  Schema.transformOrFail(HexString, Schema.instanceOf(PublicKey.Ed25519), {
    decode: (hex) => Effect.succeed(new PublicKey.Ed25519(hex)),
    encode: (publicKey) => Effect.succeed(HexString.make(publicKey.hex())),
  }),
);
export type Ed25519PublicKey = typeof Ed25519PublicKeySchema.Type;

export const Ed25519PrivateKeySchema = Schema.asSchema(
  Schema.transformOrFail(HexString, Schema.instanceOf(PrivateKey.Ed25519), {
    decode: (hex) => Effect.succeed(new PrivateKey.Ed25519(hex)),
    encode: (publicKey) =>
      Effect.succeed(
        HexString.make(Convert.Uint8Array.toHexString(publicKey.bytes)),
      ),
  }),
);

export const ManifestSchema = Schema.asSchema(
  Schema.transformOrFail(
    TransactionManifestString,
    Schema.Struct({
      instructions: Schema.Struct({
        kind: Schema.Literal('String'),
        value: TransactionManifestString,
      }),
      blobs: Schema.mutable(Schema.Array(Schema.Uint8Array)),
    }),
    {
      decode: (value) =>
        Effect.succeed({
          instructions: {
            kind: 'String' as const,
            value,
          },
          blobs: [],
        }),
      encode: (input) =>
        Effect.succeed(
          TransactionManifestString.make(input.instructions.value),
        ),
    },
  ),
);

export type Manifest = typeof ManifestSchema.Type;
export type ManifestEncoded = TransactionManifestString;

const PlainTextMessageSchema = Schema.Struct({
  kind: Schema.Literal('PlainText'),
  value: Schema.Struct({
    message: Schema.Struct({
      kind: Schema.Literal('String'),
      value: TransactionMessageString,
    }),
    mimeType: Schema.Literal('text/plain'),
  }),
});

const EmptyMessageSchema = Schema.Struct({ kind: Schema.Literal('None') });

export const TransactionMessageSchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.OptionFromUndefinedOr(TransactionMessageString),
    Schema.Union(PlainTextMessageSchema, EmptyMessageSchema),
    {
      decode: (value) =>
        Option.match(value, {
          onNone: () => Effect.succeed({ kind: 'None' as const }),
          onSome: (value) =>
            Effect.succeed({
              kind: 'PlainText' as const,
              value: {
                message: { kind: 'String' as const, value },
                mimeType: 'text/plain' as const,
              },
            }),
        }),
      encode: (input) =>
        Effect.succeed(
          input.kind === 'None'
            ? Option.none()
            : Option.some(
                TransactionMessageString.make(input.value.message.value),
              ),
        ),
    },
  ),
);

export type TransactionMessage = typeof TransactionMessageSchema.Type;

export const TransactionHeaderSchema = Schema.Struct({
  networkId: NetworkId,
  startEpochInclusive: Epoch,
  endEpochExclusive: Epoch,
  notaryPublicKey: Ed25519PublicKeySchema,
  nonce: Nonce,
  notaryIsSignatory: Schema.Boolean,
  tipPercentage: Schema.Number,
});

export type TransactionHeader = typeof TransactionHeaderSchema.Type;

export const TransactionIntentSchema = Schema.Struct({
  header: TransactionHeaderSchema,
  message: TransactionMessageSchema,
  manifest: ManifestSchema,
});
export type TransactionIntent = typeof TransactionIntentSchema.Type;
export type TransactionIntentEncoded = typeof TransactionIntentSchema.Encoded;

export const Ed25519SignatureWithPublicKeySchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.Struct({
      signature: HexString,
      signerPublicKey: HexString,
      curve: Schema.Literal('Ed25519'),
    }),
    Schema.instanceOf(SignatureWithPublicKey.Ed25519),
    {
      strict: false,
      decode: (value) =>
        Effect.succeed(
          new SignatureWithPublicKey.Ed25519(
            value.signature,
            value.signerPublicKey,
          ),
        ),
      encode: (input) =>
        Effect.succeed({
          signature: HexString.make(
            Convert.Uint8Array.toHexString(input.signature),
          ),
          signerPublicKey: HexString.make(
            Convert.Uint8Array.toHexString(input.publicKey),
          ),
        }),
    },
  ),
);

export type Ed25519SignatureWithPublicKey =
  typeof Ed25519SignatureWithPublicKeySchema.Type;

export type Ed25519SignatureWithPublicKeyEncoded =
  typeof Ed25519SignatureWithPublicKeySchema.Encoded;

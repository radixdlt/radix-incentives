import {
  Convert,
  PrivateKey,
  PublicKey,
  SignatureWithPublicKey,
} from '@radixdlt/radix-engine-toolkit';
import { Brand, Effect, Option, Schema } from 'effect';

export type Epoch = number & Brand.Brand<'Epoch'>;
export const Epoch = Brand.nominal<Epoch>();

export type NetworkId = number & Brand.Brand<'NetworkId'>;
export const NetworkId = Brand.nominal<NetworkId>();

export type Nonce = number & Brand.Brand<'Nonce'>;
export const Nonce = Brand.nominal<Nonce>();

export type HexString = string & Brand.Brand<'HexString'>;
export const HexString = Brand.nominal<HexString>();

export type TransactionId = string & Brand.Brand<'TransactionId'>;
export const TransactionId = Brand.nominal<TransactionId>();

export const Ed25519PublicKeySchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.String.pipe(Schema.fromBrand(HexString)),
    Schema.instanceOf(PublicKey.Ed25519),
    {
      decode: (hex) => Effect.succeed(new PublicKey.Ed25519(hex)),
      encode: (publicKey) => Effect.succeed(HexString(publicKey.hex())),
    },
  ),
);
export type Ed25519PublicKey = typeof Ed25519PublicKeySchema.Type;

export const Ed25519PrivateKeySchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.String.pipe(Schema.fromBrand(HexString)),
    Schema.instanceOf(PrivateKey.Ed25519),
    {
      decode: (hex) => Effect.succeed(new PrivateKey.Ed25519(hex)),
      encode: (publicKey) =>
        Effect.succeed(
          HexString(Convert.Uint8Array.toHexString(publicKey.bytes)),
        ),
    },
  ),
);

export type TransactionManifestString = string &
  Brand.Brand<'TransactionManifestString'>;
export const TransactionManifestString =
  Brand.nominal<TransactionManifestString>();

export const StringManifestSchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.String.pipe(Schema.fromBrand(TransactionManifestString)),
    Schema.Struct({
      instructions: Schema.Struct({
        kind: Schema.Literal('String'),
        value: Schema.String.pipe(Schema.fromBrand(TransactionManifestString)),
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
        Effect.succeed(TransactionManifestString(input.instructions.value)),
    },
  ),
);

export type StringManifestDecoded = typeof StringManifestSchema.Type;
export type StringManifestEncoded = TransactionManifestString;

export type TransactionMessage = string & Brand.Brand<'TransactionMessage'>;
export const TransactionMessage = Brand.nominal<TransactionMessage>();

const PlainTextMessageSchema = Schema.Struct({
  kind: Schema.Literal('PlainText'),
  value: Schema.Struct({
    message: Schema.Struct({
      kind: Schema.Literal('String'),
      value: Schema.String.pipe(Schema.fromBrand(TransactionMessage)),
    }),
    mimeType: Schema.Literal('text/plain'),
  }),
});

const EmptyMessageSchema = Schema.Struct({ kind: Schema.Literal('None') });

export const TransactionMessageSchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.OptionFromUndefinedOr(
      Schema.String.pipe(Schema.fromBrand(TransactionMessage)),
    ),
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
            : Option.some(TransactionMessage(input.value.message.value)),
        ),
    },
  ),
);

export type TransactionMessageDecoded = typeof TransactionMessageSchema.Type;

export const TransactionHeaderSchema = Schema.Struct({
  networkId: Schema.Number.pipe(Schema.fromBrand(NetworkId)),
  startEpochInclusive: Schema.Number.pipe(Schema.fromBrand(Epoch)),
  endEpochExclusive: Schema.Number.pipe(Schema.fromBrand(Epoch)),
  notaryPublicKey: Ed25519PublicKeySchema,
  nonce: Schema.Number.pipe(Schema.fromBrand(Nonce)),
  notaryIsSignatory: Schema.Boolean,
  tipPercentage: Schema.Number,
});

export type TransactionHeader = typeof TransactionHeaderSchema.Type;

export const TransactionIntentSchema = Schema.Struct({
  header: TransactionHeaderSchema,
  message: TransactionMessageSchema,
  manifest: StringManifestSchema,
});
export type TransactionIntentEncoded = typeof TransactionIntentSchema.Encoded;

export const Ed25519SignatureWithPublicKeySchema = Schema.transformOrFail(
  Schema.Struct({
    signature: Schema.String.pipe(Schema.fromBrand(HexString)),
    signerPublicKey: Schema.String.pipe(Schema.fromBrand(HexString)),
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
        signature: HexString(Convert.Uint8Array.toHexString(input.signature)),
        signerPublicKey: HexString(
          Convert.Uint8Array.toHexString(input.publicKey),
        ),
      }),
  },
);

export type Ed25519SignatureWithPublicKey =
  typeof Ed25519SignatureWithPublicKeySchema.Type;

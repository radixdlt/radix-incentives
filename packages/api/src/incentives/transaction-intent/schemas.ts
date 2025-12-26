import {
  Convert,
  PrivateKey,
  PublicKey,
  SignatureWithPublicKey,
} from '@radixdlt/radix-engine-toolkit';
import { Effect, Option, Schema } from 'effect';
import {
  Base64String,
  Epoch,
  FungibleResourceAddress,
  HexString,
  NetworkId,
  Nonce,
  TransactionManifestString,
  TransactionMessageString,
} from 'shared/brandedTypes';

export const Base64FromHexSchema = Schema.asSchema(
  Schema.transformOrFail(HexString, Base64String, {
    decode: (hex) =>
      Effect.succeed(
        Base64String.make(Buffer.from(hex, 'hex').toString('base64')),
      ),
    encode: (base64) =>
      Effect.succeed(
        HexString.make(Buffer.from(base64, 'base64').toString('hex')),
      ),
  }),
);

export const HexFromBase64Schema = Schema.asSchema(
  Schema.transformOrFail(Base64String, HexString, {
    decode: (base64) =>
      Effect.succeed(
        HexString.make(Buffer.from(base64, 'base64').toString('hex')),
      ),
    encode: (hex) =>
      Effect.succeed(
        Base64String.make(Buffer.from(hex, 'hex').toString('base64')),
      ),
  }),
);

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

export type Ed25519PrivateKey = typeof Ed25519PrivateKeySchema.Type;

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

export const BadgeDecodedSchema = Schema.Struct({
  type: Schema.Literal('fungibleResource'),
  resourceAddress: FungibleResourceAddress,
});

export const BadgeSchema = Schema.transformOrFail(
  Schema.Struct({
    type: Schema.String,
    resourceAddress: Schema.String,
  }),
  BadgeDecodedSchema,
  {
    strict: true,
    decode: (value) =>
      Effect.succeed(
        Schema.Struct({
          type: Schema.Literal('fungibleResource'),
          resourceAddress: FungibleResourceAddress,
        }).make({
          type: 'fungibleResource',
          resourceAddress: FungibleResourceAddress.make(value.resourceAddress),
        }),
      ),
    encode: (value) => Effect.succeed(value),
  },
);

export type Badge = typeof BadgeSchema.Type;

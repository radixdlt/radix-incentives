import { FetchHttpClient, HttpBody, HttpClient } from '@effect/platform';
import {
  Array as A,
  Config,
  Effect,
  Option,
  ParseResult,
  pipe,
  Record as R,
  String as S,
  Schema,
} from 'effect';
import {
  Base64FromHexSchema,
  Base64String,
  Ed25519SignatureWithPublicKeySchema,
  HexFromBase64Schema,
  HexString,
} from '../schemas';

const SignResponseSchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.Struct({
      data: Schema.Struct({
        signature: Schema.String,
      }),
    }),
    HexString,
    {
      strict: true,
      decode: (input) =>
        pipe(
          input.data.signature,
          S.split(':'),
          A.last,
          Option.getOrThrow,
          Base64String.make,
          Schema.decode(HexFromBase64Schema),
          Effect.catchTag('ParseError', (error) =>
            ParseResult.fail(error.issue),
          ),
        ),
      encode: (value, _, ast) =>
        ParseResult.fail(
          new ParseResult.Forbidden(
            ast,
            value,
            'Encoding signatures back to response format is forbidden.',
          ),
        ),
    },
  ),
);

const PublicKeyResponseSchema = Schema.asSchema(
  Schema.transformOrFail(
    Schema.Struct({
      data: Schema.Struct({
        keys: Schema.Record({
          key: Schema.String,
          value: Schema.Struct({ public_key: Base64String }),
        }),
      }),
    }),
    HexString,
    {
      strict: true,
      decode: (input) =>
        pipe(
          input.data.keys,
          (keys) => R.values(keys),
          A.head,
          Option.map((item) => item.public_key),
          Option.getOrThrow,
          Schema.decode(HexFromBase64Schema),
          Effect.catchTag('ParseError', (error) =>
            ParseResult.fail(error.issue),
          ),
        ),
      encode: (value, _, ast) =>
        ParseResult.fail(
          new ParseResult.Forbidden(
            ast,
            value,
            'Encoding public keys back to response format is forbidden.',
          ),
        ),
    },
  ),
);

export class Vault extends Effect.Service<Vault>()('Vault', {
  dependencies: [FetchHttpClient.layer],
  effect: Effect.gen(function* () {
    const token = yield* Config.string('VAULT_TOKEN').pipe(Effect.orDie);

    const keyName = yield* Config.string('VAULT_KEY_NAME').pipe(
      Config.withDefault('xrd-distribution'),
    );

    const baseUrl = yield* Config.string('VAULT_BASE_URL')
      .pipe(Config.withDefault('http://localhost:8200/v1'))
      .pipe(Effect.orDie);

    const httpClient = yield* HttpClient.HttpClient;

    const getPublicKey = () =>
      httpClient
        .get(`${baseUrl}/transit/keys/${keyName}`, {
          headers: {
            'X-Vault-Token': token,
          },
        })
        .pipe(
          Effect.flatMap((response) => response.json),
          Effect.flatMap(Schema.decodeUnknown(PublicKeyResponseSchema)),
        );

    const toSignatureWithPublicKey = (hash: HexString) =>
      Effect.gen(function* () {
        const signature = yield* httpClient
          .post(`${baseUrl}/transit/sign/${keyName}`, {
            headers: {
              'X-Vault-Token': token,
              'Content-Type': 'application/json',
            },
            body: yield* Schema.decode(Base64FromHexSchema)(hash).pipe(
              Effect.flatMap((base64) =>
                HttpBody.json({
                  input: base64,
                }),
              ),
            ),
          })
          .pipe(
            Effect.flatMap((response) => response.json),
            Effect.flatMap(Schema.decodeUnknown(SignResponseSchema)),
          );

        const publicKeyHex = yield* getPublicKey();

        const encoded = {
          signature,
          signerPublicKey: publicKeyHex,
          curve: 'Ed25519' as const,
        };

        yield* Effect.log(encoded);

        return yield* Schema.decode(Ed25519SignatureWithPublicKeySchema)(
          encoded,
        );
      }).pipe(
        Effect.annotateLogs({
          signer: 'Vault',
          keyName,
        }),
      );

    return {
      getPublicKey,
      toSignatureWithPublicKey,
    };
  }),
}) {}

import {
  FetchHttpClient,
  FileSystem,
  HttpBody,
  HttpClient,
} from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
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
import { Base64String, HexString } from 'shared/brandedTypes';
import {
  Base64FromHexSchema,
  Ed25519SignatureWithPublicKeySchema,
  HexFromBase64Schema,
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

/**
 * Reads the Vault token from a file or falls back to environment variable.
 * In production, Vault Agent writes the token to a file and handles renewal.
 * For local development, you can use either VAULT_TOKEN_FILE or VAULT_TOKEN.
 */
const getVaultToken = (fs: FileSystem.FileSystem) =>
  Effect.gen(function* () {
    const tokenFilePath = yield* Config.string('VAULT_TOKEN_FILE').pipe(
      Config.option,
      Effect.map(Option.getOrUndefined),
    );

    if (tokenFilePath) {
      const content = yield* fs.readFileString(tokenFilePath);
      return content.trim();
    }

    return yield* Config.string('VAULT_TOKEN');
  });

export class Vault extends Effect.Service<Vault>()('Vault', {
  dependencies: [FetchHttpClient.layer, NodeFileSystem.layer],
  effect: Effect.gen(function* () {
    const keyName = yield* Config.string('VAULT_KEY_NAME').pipe(
      Config.withDefault('xrd-distribution'),
    );

    const baseUrl = yield* Config.string('VAULT_BASE_URL').pipe(
      Config.withDefault('http://localhost:8200/v1'),
      Effect.orDie,
    );

    const httpClient = yield* HttpClient.HttpClient;
    const fs = yield* FileSystem.FileSystem;

    const getPublicKey = () =>
      Effect.gen(function* () {
        const token = yield* getVaultToken(fs);
        return yield* httpClient
          .get(`${baseUrl}/transit/keys/${keyName}`, {
            headers: {
              'X-Vault-Token': token,
            },
          })
          .pipe(
            Effect.flatMap((response) => response.json),
            Effect.flatMap(Schema.decodeUnknown(PublicKeyResponseSchema)),
          );
      });

    const toSignatureWithPublicKey = (hash: HexString) =>
      Effect.gen(function* () {
        const token = yield* getVaultToken(fs);

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

import { FileSystem, HttpBody, HttpClient } from '@effect/platform';
import { NodeFileSystem, NodeHttpClient } from '@effect/platform-node';
import {
  Array as A,
  Config,
  Duration,
  Effect,
  Layer,
  Option,
  ParseResult,
  pipe,
  Record as R,
  String as S,
  Schedule,
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

const NodeHttpClientLive = NodeHttpClient.layerWithoutAgent.pipe(
  Layer.provide(
    NodeHttpClient.makeAgentLayer({
      rejectUnauthorized: false, // Allow self-signed certificates for internal cluster traffic
    }),
  ),
);

export class Vault extends Effect.Service<Vault>()('Vault', {
  dependencies: [NodeHttpClientLive, NodeFileSystem.layer],
  effect: Effect.gen(function* () {
    const keyName = yield* Config.string('VAULT_KEY_NAME').pipe(
      Config.withDefault('xrd-distribution'),
    );

    const baseUrl = yield* Config.string('VAULT_BASE_URL').pipe(
      Config.withDefault('http://localhost:8200'),
      Effect.orDie,
    );

    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.retryTransient({
        schedule: Schedule.exponential(Duration.millis(100)),
        times: 3,
      }),
      HttpClient.tapError((error) =>
        Effect.logError('Vault request error', { error }),
      ),
      HttpClient.tap((response) =>
        response.status >= 200 && response.status < 300
          ? Effect.void
          : response.json.pipe(
              Effect.tap((body) =>
                Effect.logError('Vault request failed', {
                  status: response.status,
                  url: response.request.url,
                  body,
                }),
              ),
              Effect.ignore, // Don't fail if body isn't JSON
            ),
      ),
      HttpClient.filterStatusOk,
    );
    const fs = yield* FileSystem.FileSystem;

    const getPublicKey = () =>
      Effect.gen(function* () {
        const token = yield* getVaultToken(fs);
        return yield* httpClient
          .get(`${baseUrl}/v1/transit/keys/${keyName}`, {
            headers: {
              'X-Vault-Token': token,
            },
          })
          .pipe(
            Effect.tapError(Effect.logError),
            Effect.flatMap((response) => response.json),
            Effect.flatMap(Schema.decodeUnknown(PublicKeyResponseSchema)),
          );
      }).pipe(Effect.orDie);

    const toSignatureWithPublicKey = (hash: HexString) =>
      Effect.gen(function* () {
        const token = yield* getVaultToken(fs);

        const signature = yield* httpClient
          .post(`${baseUrl}/v1/transit/sign/${keyName}`, {
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
            Effect.tap((response) => Effect.log(response)),
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

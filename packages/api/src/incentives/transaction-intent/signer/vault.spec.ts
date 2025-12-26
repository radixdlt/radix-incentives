import { HttpClient, HttpClientResponse } from '@effect/platform';
import { layer } from '@effect/vitest';
import { Effect, Exit, Layer, Logger } from 'effect';
import { HexString } from 'shared/brandedTypes';
import { describe, expect, it } from 'vitest';
import { Vault } from './vault';

layer(Vault.Default)('Vault', (it) => {
  it.effect.skip('should sign a hash', () =>
    Effect.gen(function* () {
      const vault = yield* Vault;
      const signature = yield* vault.toSignatureWithPublicKey(
        HexString.make('1234567890'),
      );

      yield* Effect.log(signature);
    }).pipe(Effect.provide(Logger.pretty)),
  );

  it.effect.skip('should get public key', () =>
    Effect.gen(function* () {
      const vault = yield* Vault;
      const publicKey = yield* vault.getPublicKey();

      yield* Effect.log(publicKey);
    }).pipe(Effect.provide(Logger.pretty)),
  );
});

describe('Vault with mocked HttpClient', () => {
  it('should handle failed response from Vault', async () => {
    const mockHttpClient = HttpClient.make((req) =>
      Effect.succeed(
        HttpClientResponse.fromWeb(
          req,
          new Response(
            JSON.stringify({
              errors: ['permission denied'],
            }),
            { status: 403, statusText: 'Forbidden' },
          ),
        ),
      ),
    );

    const MockHttpClientLayer = Layer.succeed(
      HttpClient.HttpClient,
      mockHttpClient,
    );

    const TestVaultLayer = Vault.DefaultWithoutDependencies.pipe(
      Layer.provide(MockHttpClientLayer),
    );

    const program = Effect.gen(function* () {
      const vault = yield* Vault;
      return yield* vault.getPublicKey();
    }).pipe(Effect.provide(TestVaultLayer));

    const result = await Effect.runPromiseExit(program);

    expect(Exit.isFailure(result)).toBe(true);
  });

  it('should handle invalid JSON response from Vault', async () => {
    const mockHttpClient = HttpClient.make((req) =>
      Effect.succeed(
        HttpClientResponse.fromWeb(
          req,
          new Response(
            JSON.stringify({
              data: { keys: {} }, // Empty keys - will fail schema parsing
            }),
            { status: 200 },
          ),
        ),
      ),
    );

    const MockHttpClientLayer = Layer.succeed(
      HttpClient.HttpClient,
      mockHttpClient,
    );

    const TestVaultLayer = Vault.DefaultWithoutDependencies.pipe(
      Layer.provide(MockHttpClientLayer),
    );

    const program = Effect.gen(function* () {
      const vault = yield* Vault;
      return yield* vault.getPublicKey();
    }).pipe(Effect.provide(TestVaultLayer));

    const result = await Effect.runPromiseExit(program);

    expect(Exit.isFailure(result)).toBe(true);
  });
});

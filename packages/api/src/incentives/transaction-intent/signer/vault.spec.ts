import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { HexString } from 'shared/brandedTypes';
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
});

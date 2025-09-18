import { layer } from '@effect/vitest';
import { Effect } from 'effect';
import { createAccount } from '../../test-helpers/createAccount';
import { CheckAccountPersistenceService } from './checkAccountPersistence';

layer(CheckAccountPersistenceService.Default)(
  'checkAccountPersistenceService',
  (it) => {
    it.effect('should check account persistence', () =>
      Effect.gen(function* () {
        const checkAccountPersistenceService =
          yield* CheckAccountPersistenceService;
        const virtualAccount = yield* createAccount();
        const account =
          'account_rdx1680ldd0sgl547sp05eqdpt3x8wvq004qeh7rk54t65t7yxn87ukunn';

        // Should return VirtualAccountError
        const result = yield* checkAccountPersistenceService([
          virtualAccount.address,
          account,
        ]).pipe(
          Effect.catchTag('VirtualAccountError', () =>
            Effect.succeed('VirtualAccountError'),
          ),
        );
        expect(result).toBe('VirtualAccountError');

        // Should not throw an error
        yield* checkAccountPersistenceService([account]);
      }),
    );
  },
);

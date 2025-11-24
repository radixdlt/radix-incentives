import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { GetLedgerStateService } from '../../../common/gateway';
import { AccountBalanceState, ValidatorsState } from './accountBalanceState';
import accountBalancesFixture from './accountBalancesFixture.json' with {
  type: 'json',
};
import { GetAccountBalancesAtStateVersionV2 } from './getAccountBalances';

const testSetup = Effect.gen(function* () {
  return {
    addresses: [
      'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
    ],
    stateVersion: accountBalancesFixture.stateVersion,
  };
}).pipe(Effect.provide(GetLedgerStateService.Default));

layer(GetAccountBalancesAtStateVersionV2.Default)(
  'GetAccountBalancesAtStateVersionV2',
  (it) => {
    it.effect(
      'should get account balances at state version',
      () =>
        Effect.gen(function* () {
          const accountBalanceState = yield* AccountBalanceState;
          const getAccountBalancesAtStateVersion =
            yield* GetAccountBalancesAtStateVersionV2;
          const { addresses, stateVersion } = yield* testSetup;

          const validatorStateRef =
            yield* accountBalanceState.makeValidatorsState;

          const accountBalances = yield* getAccountBalancesAtStateVersion({
            addresses,
            stateVersion: stateVersion,
          }).pipe(Effect.provideService(ValidatorsState, validatorStateRef));

          expect(accountBalances).toEqual(
            accountBalancesFixture.accountBalances,
          );
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(AccountBalanceState.Default),
        ),
      { timeout: 300_000 },
    );
  },
);

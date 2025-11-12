import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { GetLedgerStateService } from '../../../common/gateway';
import { AccountBalanceState, ValidatorsState } from './accountBalanceState';
import { GetAccountBalancesAtStateVersionV2 } from './getAccountBalances';

const testSetup = Effect.gen(function* () {
  const getLedgerState = yield* GetLedgerStateService;

  const ledgerState = yield* getLedgerState({
    at_ledger_state: {
      timestamp: new Date('2025-11-12T14:00:00.000Z'),
    },
  });

  return {
    addresses: [
      'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
    ],
    stateVersion: ledgerState.state_version,
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

          yield* Effect.log(accountBalances);
        }).pipe(
          Effect.provide(Logger.pretty),
          Effect.provide(AccountBalanceState.Default),
        ),
      { timeout: 300_000 },
    );
  },
);

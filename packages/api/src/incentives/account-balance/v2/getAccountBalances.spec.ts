import { layer } from '@effect/vitest';
import { Assets } from 'data';
import { Effect, Logger } from 'effect';
import { accountsData } from '../../../../../db/src/incentives/seed/data/accounts30KData';
import { GetLedgerStateService } from '../../../common/gateway';
import { getTokenHolders } from '../../../test-helpers/getTokenHolders';
import { AccountBalanceState, ValidatorsState } from './accountBalanceState';
import { GetAccountBalancesAtStateVersionV2 } from './getAccountBalances';

const testSetup = Effect.gen(function* () {
  const getLedgerState = yield* GetLedgerStateService;

  const addresses = accountsData.map((account) => account.address).slice(0, 10);

  const ledgerState = yield* getLedgerState({
    at_ledger_state: {
      timestamp: new Date('2025-11-01T00:00:00.000Z'),
    },
  });

  const lsulpHolders = yield* getTokenHolders(Assets.Fungible.LSULP).pipe(
    Effect.map((items) =>
      items
        .map((holder) => holder.holder_address)
        .filter((address) => address.includes('account_'))
        .slice(0, 10),
    ),
  );

  return {
    addresses: [...addresses, ...lsulpHolders],
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

import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { accountsData } from '../../../../../db/src/incentives/seed/data/accounts30KData';

import { GetLedgerStateService } from '../../../common/gateway';
import { GetAccountBalancesAtStateVersionV2 } from './getAccountBalances';

const testSetup = Effect.gen(function* () {
  const getLedgerState = yield* GetLedgerStateService;

  const addresses = accountsData.map((account) => account.address).slice(0, 10);

  const ledgerState = yield* getLedgerState({
    at_ledger_state: {
      timestamp: new Date('2025-10-24T00:00:00.000Z'),
    },
  });

  return { addresses, stateVersion: ledgerState.state_version };
}).pipe(Effect.provide(GetLedgerStateService.Default));

layer(GetAccountBalancesAtStateVersionV2.Default)(
  'GetAccountBalancesAtStateVersionV2',
  (it) => {
    it.effect(
      'should get account balances at state version',
      () =>
        Effect.gen(function* () {
          const getAccountBalancesAtStateVersion =
            yield* GetAccountBalancesAtStateVersionV2;
          const { addresses, stateVersion } = yield* testSetup;

          yield* getAccountBalancesAtStateVersion({
            addresses,
            stateVersion: stateVersion,
          });
        }).pipe(Effect.provide(Logger.pretty)),
      { timeout: 300_000 },
    );
  },
);

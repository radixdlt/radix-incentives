import fs from 'node:fs';
import path from 'node:path';
import { GetLedgerStateService } from 'api/common/gateway/getLedgerState';
import {
  AccountBalanceState,
  ValidatorsState,
} from 'api/incentives/account-balance/v2/accountBalanceState';
import { GetAccountBalancesAtStateVersionV2 } from 'api/incentives/account-balance/v2/getAccountBalances';
import { Effect, Logger } from 'effect';

const runnable = Effect.gen(function* () {
  yield* Effect.log('Generating fixtures...');
  const getAccountBalancesAtStateVersion =
    yield* GetAccountBalancesAtStateVersionV2;
  const accountBalanceState = yield* AccountBalanceState;

  const validatorStateRef = yield* accountBalanceState.makeValidatorsState;

  const getLedgerStateService = yield* GetLedgerStateService;
  const ledgerState = yield* getLedgerStateService({
    at_ledger_state: {
      timestamp: new Date(),
    },
  });

  const accountBalances = yield* getAccountBalancesAtStateVersion({
    addresses: [
      'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
    ],
    stateVersion: ledgerState.state_version,
  }).pipe(Effect.provideService(ValidatorsState, validatorStateRef));

  const outputPath = path.join(
    import.meta.dirname,
    '../../../',
    'packages/api/src/incentives/account-balance/v2/accountBalancesFixture.json',
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      { stateVersion: ledgerState.state_version, accountBalances },
      null,
      2,
    ),
  );
  yield* Effect.log(`file written to ${outputPath}`);
});

await Effect.runPromise(
  runnable.pipe(
    Effect.provide(Logger.pretty),
    Effect.provide(GetAccountBalancesAtStateVersionV2.Default),
    Effect.provide(GetLedgerStateService.Default),
    Effect.provide(AccountBalanceState.Default),
  ),
);

process.exit(0);

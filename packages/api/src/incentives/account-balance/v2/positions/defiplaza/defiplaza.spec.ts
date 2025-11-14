import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { getLedgerStateByDate } from '../../../../../test-helpers/ledgerState';
import {
  AccountBalanceState,
  FungibleTokenBalanceState,
} from '../../accountBalanceState';
import { AccountAddress, StateVersion } from '../../schemas';
import { DefiPlazaPosition } from './defiplaza';

layer(DefiPlazaPosition.Default)('GetAccountBalancesAtStateVersionV2', (it) => {
  it.effect(
    'should get account balances at state version',
    () =>
      Effect.gen(function* () {
        const accountBalanceState = yield* AccountBalanceState;
        const defiPlazaPosition = yield* DefiPlazaPosition;
        const { stateVersion, timestamp } = yield* getLedgerStateByDate(
          new Date('2025-11-12T00:00:00Z'),
        );

        const addresses = [
          'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
        ].map(AccountAddress);

        const accountBalances = yield* defiPlazaPosition
          .fromState({
            addresses,
            stateVersion: StateVersion(stateVersion),
            timestamp,
          })
          .pipe(
            Effect.provideService(
              FungibleTokenBalanceState,
              yield* accountBalanceState.makeFungibleTokenBalanceState({
                addresses,
                stateVersion,
              }),
            ),
          );

        yield* Effect.log(accountBalances);
      }).pipe(
        Effect.provide(Logger.pretty),
        Effect.provide(AccountBalanceState.Default),
      ),
    { timeout: 300_000 },
  );
});

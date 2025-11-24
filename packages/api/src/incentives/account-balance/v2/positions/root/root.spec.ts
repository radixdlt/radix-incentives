import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { getLedgerStateByDate } from '../../../../../test-helpers/ledgerState';
import {
  AccountBalanceState,
  FungibleTokenBalanceState,
  NonFungibleTokenBalanceState,
} from '../../accountBalanceState';
import { AccountAddress, StateVersion } from '../../schemas';
import { RootFinancePosition } from './root';

layer(RootFinancePosition.Default)(
  'GetAccountBalancesAtStateVersionV2',
  (it) => {
    it.effect(
      'should get account balances at state version',
      () =>
        Effect.gen(function* () {
          const accountBalanceState = yield* AccountBalanceState;
          const rootFinancePosition = yield* RootFinancePosition;
          const { stateVersion, timestamp } = yield* getLedgerStateByDate(
            new Date('2025-11-12T00:00:00Z'),
          );

          const addresses = [
            'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
          ].map(AccountAddress);

          const accountBalances = yield* rootFinancePosition
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
              Effect.provideService(
                NonFungibleTokenBalanceState,
                yield* accountBalanceState.makeNonFungibleTokenBalanceState({
                  addresses,
                  stateVersion,
                  resourceAddresses: [RootFinancePosition.nftResourceAddress],
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
  },
);

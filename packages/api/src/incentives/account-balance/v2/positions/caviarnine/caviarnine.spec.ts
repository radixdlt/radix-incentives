import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { getLedgerStateByDate } from '../../../../../test-helpers/ledgerState';
import {
  AccountBalanceState,
  FungibleTokenBalanceState,
  NonFungibleTokenBalanceState,
} from '../../accountBalanceState';
import { AccountAddress } from '../../schemas';
import { CaviarNinePositions } from './caviarnine';

layer(CaviarNinePositions.Default)(
  'GetAccountBalancesAtStateVersionV2',
  (it) => {
    it.effect(
      'should get account balances at state version',
      () =>
        Effect.gen(function* () {
          const accountBalanceState = yield* AccountBalanceState;
          const caviarNinePositions = yield* CaviarNinePositions;
          const { stateVersion, timestamp } = yield* getLedgerStateByDate(
            new Date('2025-11-12T00:00:00Z'),
          );

          const addresses = [
            'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
          ].map(AccountAddress);

          const accountBalances = yield* caviarNinePositions
            .fromState({
              addresses,
              stateVersion,
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
                  resourceAddresses:
                    CaviarNinePositions.nonFungibleResourceAddresses,
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

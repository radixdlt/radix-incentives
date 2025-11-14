import { layer } from '@effect/vitest';
import { Effect, Logger } from 'effect';
import { getLedgerStateByStateVersion } from '../../../../../test-helpers/ledgerState';
import {
  AccountBalanceState,
  FungibleTokenBalanceState,
  NonFungibleTokenBalanceState,
} from '../../accountBalanceState';
import { AccountAddress, StateVersion } from '../../schemas';
import { FluxPosition } from './flux';

layer(FluxPosition.Default)('GetAccountBalancesAtStateVersionV2', (it) => {
  it.effect(
    'should get account balances at state version',
    () =>
      Effect.gen(function* () {
        const accountBalanceState = yield* AccountBalanceState;
        const fluxPosition = yield* FluxPosition;
        const { stateVersion, timestamp } =
          yield* getLedgerStateByStateVersion(302444078);

        const addresses = [
          'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
          'account_rdx16y4gqnchvxeszcpswg2zldgsle6uqvnl0znerne70tw9535njhkgzk',
          'account_rdx168nr5dwmll4k2x5apegw5dhrpejf3xac7khjhgjqyg4qddj9tg9v4d',
        ].map(AccountAddress);

        const accountBalances = yield* fluxPosition
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
                resourceAddresses: [FluxPosition.nftResourceAddress],
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

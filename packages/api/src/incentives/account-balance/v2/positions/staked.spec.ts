import { layer } from '@effect/vitest';
import { Effect, Logger, Ref } from 'effect';
import { map } from 'effect/Array';
import { getLedgerStateByDate } from '../../../../test-helpers/ledgerState';
import {
  AccountBalanceState,
  FungibleTokenBalanceState,
  NonFungibleTokenBalanceState,
  ValidatorsState,
} from '../accountBalanceState';
import { AccountAddress } from '../schemas';
import stakedFixture from './fixtures/staked.fixture';
import { StakedPosition } from './staked';

layer(StakedPosition.Default)('StakedXrdPosition', (it) => {
  it.effect('should get staked xrd positions', () =>
    Effect.gen(function* () {
      const stakedPosition = yield* StakedPosition;
      const accountBalanceState = yield* AccountBalanceState;

      const { timestamp, stateVersion } = yield* getLedgerStateByDate(
        new Date('2025-11-01T00:00:00Z'),
      );

      const validatorStateRef = yield* accountBalanceState.makeValidatorsState;

      const claimNftResourceAddresses = yield* Ref.get(validatorStateRef).pipe(
        Effect.map(map((validator) => validator.claimNftResourceAddress)),
      );

      const accountAddresses = Object.keys(stakedFixture).map(AccountAddress);

      const result = yield* stakedPosition
        .fromState({
          addresses: accountAddresses,
          stateVersion,
          timestamp,
        })
        .pipe(
          Effect.provideService(
            FungibleTokenBalanceState,
            yield* accountBalanceState.makeFungibleTokenBalanceState({
              addresses: accountAddresses,
              stateVersion,
            }),
          ),
          Effect.provideService(ValidatorsState, validatorStateRef),
          Effect.provideService(
            NonFungibleTokenBalanceState,
            yield* accountBalanceState.makeNonFungibleTokenBalanceState({
              addresses: accountAddresses,
              stateVersion,
              resourceAddresses: claimNftResourceAddresses,
            }),
          ),
        );
      expect(result).toEqual(stakedFixture);
    }).pipe(
      Effect.provide(AccountBalanceState.Default),
      Effect.provide(Logger.pretty),
    ),
  );
});

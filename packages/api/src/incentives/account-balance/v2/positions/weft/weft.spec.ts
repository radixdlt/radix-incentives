import { layer } from '@effect/vitest';
import { WeftFinanceConstants } from 'data/src/dapps/weftFinance/constants';
import { Effect, Logger } from 'effect';
import { getLedgerStateByDate } from '../../../../../test-helpers/ledgerState';
import {
  AccountBalanceState,
  FungibleTokenBalanceState,
  NonFungibleTokenBalanceState,
} from '../../accountBalanceState';
import { AccountAddress, NonFungibleResourceAddress } from '../../schemas';
import { WeftFinancePosition } from './weft';

layer(WeftFinancePosition.Default)('WeftFinancePosition', (it) => {
  it.effect('should get weft finance positions', () =>
    Effect.gen(function* () {
      const weftFinancePosition = yield* WeftFinancePosition;
      const accountBalanceState = yield* AccountBalanceState;

      const addresses = [
        'account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew',
      ].map(AccountAddress);

      const ledgerState = yield* getLedgerStateByDate(
        new Date('2025-11-18T13:00:00Z'),
      );

      const stateVersion = ledgerState.stateVersion;
      const timestamp = ledgerState.timestamp;

      const result = yield* weftFinancePosition
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
              resourceAddresses: [
                NonFungibleResourceAddress(
                  WeftFinanceConstants.v2.WeftyV2.resourceAddress,
                ),
              ],
            }),
          ),
        );

      yield* Effect.log(JSON.stringify(result, null, 2));
    }).pipe(
      Effect.provide(AccountBalanceState.Default),
      Effect.provide(Logger.pretty),
    ),
  );
});

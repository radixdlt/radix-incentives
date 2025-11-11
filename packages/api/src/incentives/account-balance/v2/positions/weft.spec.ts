import { layer } from '@effect/vitest';
import { WeftFinanceConstants } from 'data/src/dapps/weftFinance/constants';
import { Effect, Logger } from 'effect';
import { take } from 'effect/Array';
import { getNonFungibleTokenHolders } from '../../../../test-helpers/getTokenHolders';
import { getLedgerStateByDate } from '../../../../test-helpers/ledgerState';
import {
  AccountBalanceState,
  FungibleTokenBalanceState,
  NonFungibleTokenBalanceState,
} from '../accountBalanceState';
import { AccountAddress, NonFungibleResourceAddress } from '../schemas';
import { WeftFinancePosition } from './weft';

layer(WeftFinancePosition.Default)('WeftFinancePosition', (it) => {
  it.effect('should get weft finance positions', () =>
    Effect.gen(function* () {
      const weftFinancePosition = yield* WeftFinancePosition;
      const accountBalanceState = yield* AccountBalanceState;

      // // w2hUSDC
      const tokenHolders = [
        {
          address:
            'account_rdx12yntvduadhcr49nutqkrlxa54n74f0aj264j2nv9xmk3rtdu80u8cc',
          amount: '97760.362072123294143685',
        },
        {
          address:
            'account_rdx12xhq5gjdzq0lkpguyvv4m97egne2t4z98c9gzfmzk46n5jf6y63zrs',
          amount: '44374.54157314404224445',
        },
        {
          address:
            'account_rdx128ar7ktsz33tx4a7rgy0n8a68t04f0526f023zgna8c6ngzu6pzz5p',
          amount: '44109.088761878971250495',
        },
        {
          address:
            'account_rdx168j2etn95l9tyqgfj2ha5f7mv7ld2mhpjhl2jmgnrjtnze9fkeku66',
          amount: '22533.615434895035087492',
        },
        {
          address:
            'account_rdx12y00tgpqk32vrwhhykmrdw4pkzyn65q3vq6cu7437047fnky22s0uc',
          amount: '21379.405342112005407636',
        },
        {
          address:
            'account_rdx1685j3ztm6dun97r64eta7ru48d8thtcappvm4mywy0mr52s0ntgmns',
          amount: '11960.626611884190597288',
        },
        {
          address:
            'account_rdx12yam9te37wgeregsz7gyhmk9qpurhjz9vaq79egde426erpytdsrhg',
          amount: '9992.887816359512004023',
        },
        {
          address:
            'account_rdx16xjdfavmytn5cngvzkgeqhnde5el6am554dup07u2p586w9t4z0h92',
          amount: '9961.914363121977013757',
        },
        {
          address:
            'account_rdx129vykqt9ke7ycphy40dp6nvfyp596zs0s6epv4k0ynwf9pr52pdxw8',
          amount: '9953.764057270012577749',
        },
        {
          address:
            'account_rdx128kcvrsc8y2d24qnuxekkj4vlfj8zuwv8g62anh203zkqlzlqym2rt',
          amount: '7476.32679968440932165',
        },
      ];

      const weftyV2Holders = yield* getNonFungibleTokenHolders(
        WeftFinanceConstants.v2.WeftyV2.resourceAddress,
      ).pipe(Effect.map(take(2)));

      const addresses = [
        ...tokenHolders.map((item) => AccountAddress(item.address)),
        ...weftyV2Holders,
      ];

      const ledgerState = yield* getLedgerStateByDate(
        new Date('2025-11-06T00:00:00Z'),
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

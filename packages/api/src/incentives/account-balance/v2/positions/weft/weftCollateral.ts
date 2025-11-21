import { BigNumber } from 'bignumber.js';
import { WeftFinanceConstants } from 'data';
import { Effect, pipe, Record as R } from 'effect';
import s from 'sbor-ez-mode';
import {
  CollateralInfo,
  NFTCollateralInfo,
} from '../../../../../common/dapps/weftFinance/schemas';
import { AccountBalanceState } from '../../accountBalanceState';
import {
  type AccountAddress,
  Amount,
  FungibleResourceAddress,
  NonFungibleId,
  NonFungibleResourceAddress,
} from '../../schemas';

const CDPData = s.struct({
  collaterals: s.map({ key: s.address(), value: CollateralInfo }),
  nft_collaterals: s.map({ key: s.address(), value: NFTCollateralInfo }),
});

export class WeftCollateral extends Effect.Service<WeftCollateral>()(
  'WeftCollateral',
  {
    effect: Effect.gen(function* () {
      const getNftCollection =
        yield* AccountBalanceState.createGetNftCollectionFn;

      const getWeftV2CollateralsFromState = (accountAddress: AccountAddress) =>
        Effect.gen(function* () {
          const weftNftCollection = yield* getNftCollection(
            accountAddress,
            WeftCollateral.WeftyV2ResourceAddress,
            CDPData,
          );

          const nftCollaterals = weftNftCollection.reduce<
            Record<NonFungibleResourceAddress, NonFungibleId[]>
          >(
            (acc, curr) =>
              pipe(
                R.fromEntries(curr.nft_collaterals),
                R.mapEntries((i, k) => [
                  NonFungibleResourceAddress(k),
                  i.nft_ids.map(NonFungibleId),
                ]),
                R.union(acc, (a, b) => [...a, ...b]),
              ),
            {},
          );

          const fungibleCollaterals = weftNftCollection.reduce<
            Record<FungibleResourceAddress, Amount>
          >(
            (acc, curr) =>
              pipe(
                R.fromEntries(curr.collaterals),
                R.mapEntries((i, k) => [
                  FungibleResourceAddress(k),
                  Amount(i.amount),
                ]),
                R.union(acc, (a, b) =>
                  Amount(new BigNumber(a).plus(b).toString()),
                ),
              ),
            {},
          );

          return { nftCollaterals, fungibleCollaterals };
        });

      return {
        getWeftV2CollateralsFromState,
      };
    }),
  },
) {
  static WeftyV2ResourceAddress = NonFungibleResourceAddress(
    WeftFinanceConstants.v2.WeftyV2.resourceAddress,
  );
}

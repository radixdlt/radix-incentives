import BigNumber from 'bignumber.js';
import { ActivityId, Assets, DappConstants } from 'data';
import { FluxConstants } from 'data/src/dapps/flux/constants';
import { Array as A, Effect, flow, Option, Record as R } from 'effect';
import { CdpNftData } from '../../../../../common/dapps/flux';
import { GetUsdValueService } from '../../../../token-price/getUsdValue';
import { AccountBalanceState } from '../../accountBalanceState';
import { PoolUnitHelper } from '../../helpers/poolUnit';
import {
  type AccountAddress,
  Amount,
  AmountUsd,
  FungibleResourceAddress,
  NonFungibleResourceAddress,
  PoolAddress,
  StateVersion,
} from '../../schemas';

const fluxReservoirs = Object.values(FluxConstants.collaterals).map(
  (collateral) => ({
    stabilityPoolTokenAddress: FungibleResourceAddress(
      collateral.stabilityPoolTokenAddress,
    ),
    stabilityPoolAddress: PoolAddress(collateral.stabilityPoolAddress),
    collateralAddress: FungibleResourceAddress(collateral.collateralAddress),
  }),
);

export class FluxPosition extends Effect.Service<FluxPosition>()(
  'FluxPosition',
  {
    dependencies: [GetUsdValueService.Default, PoolUnitHelper.Default],
    effect: Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;
      const poolUnitHelper = yield* PoolUnitHelper;

      return {
        fromState: (input: {
          addresses: AccountAddress[];
          stateVersion: StateVersion;
          timestamp: Date;
        }) =>
          Effect.gen(function* () {
            const stateVersion = StateVersion(input.stateVersion);
            const timestamp = input.timestamp;

            const getFungibleBalance =
              yield* AccountBalanceState.createGetFungibleTokenBalanceFn;

            const getNftCollection =
              yield* AccountBalanceState.createGetNftCollectionFn;

            const getCdpPositions = (accountAddress: AccountAddress) =>
              Effect.gen(function* () {
                const nftCollection = yield* getNftCollection(
                  accountAddress,
                  FluxPosition.nftResourceAddress,
                  CdpNftData,
                ).pipe(
                  Effect.map(
                    flow(
                      A.map((item) => ({
                        collateralAddress: FungibleResourceAddress(
                          item.collateral_address,
                        ),
                        collateralAmount: Amount(item.collateral_amount),
                      })),
                    ),
                  ),
                );

                return yield* Effect.reduce(
                  nftCollection,
                  R.empty<string, AmountUsd>(),
                  (acc, item) =>
                    Effect.gen(function* () {
                      const activityId = R.get(
                        FluxPosition.cdpPositions,
                        item.collateralAddress,
                      );
                      if (Option.isNone(activityId)) return acc;

                      const amountUsd = yield* getUsdValueService({
                        amount: item.collateralAmount,
                        resourceAddress: item.collateralAddress,
                        timestamp,
                      }).pipe(
                        Effect.map((usdValue) =>
                          AmountUsd(usdValue.decimalPlaces(2).toString()),
                        ),
                      );

                      return R.union(
                        acc,
                        { [activityId.value]: amountUsd },
                        (a, b) =>
                          AmountUsd(
                            new BigNumber(a).plus(new BigNumber(b)).toString(),
                          ),
                      );
                    }),
                );
              });

            const getReservoirPositions = (accountAddress: AccountAddress) =>
              Effect.reduce(
                fluxReservoirs,
                R.empty<string, AmountUsd>(),
                (acc, reservoir) =>
                  Effect.gen(function* () {
                    const activityId = R.get(
                      FluxPosition.reservoirPositions,
                      reservoir.collateralAddress,
                    );
                    if (Option.isNone(activityId)) return acc;

                    const stabilityPoolTokenAmount = getFungibleBalance(
                      accountAddress,
                      reservoir.stabilityPoolTokenAddress,
                    );

                    if (Option.isNone(stabilityPoolTokenAmount)) return acc;

                    const { xTokenAmount: collateralAmount, yTokenAmount: _ } =
                      yield* poolUnitHelper.resolve({
                        poolAddress: reservoir.stabilityPoolAddress,
                        stateVersion,
                        xToken: reservoir.collateralAddress,
                        yToken: FungibleResourceAddress(Assets.Fungible.fUSD),
                        lpToken: stabilityPoolTokenAmount.value,
                      });

                    const amountUsd = yield* getUsdValueService({
                      amount: collateralAmount,
                      resourceAddress: reservoir.collateralAddress,
                      timestamp,
                    }).pipe(
                      Effect.map((usdValue) =>
                        AmountUsd(usdValue.decimalPlaces(2).toString()),
                      ),
                    );

                    return R.union(
                      acc,
                      { [activityId.value]: amountUsd },
                      (a, b) =>
                        AmountUsd(
                          new BigNumber(a).plus(new BigNumber(b)).toString(),
                        ),
                    );
                  }),
              );

            return yield* Effect.reduce(
              input.addresses,
              R.empty<AccountAddress, Record<string, AmountUsd>>(),
              (acc, accountAddress) =>
                Effect.gen(function* () {
                  const cdpPositions = yield* getCdpPositions(accountAddress);
                  const reservoirPositions =
                    yield* getReservoirPositions(accountAddress);

                  return R.set(acc, accountAddress, {
                    [ActivityId.fl_ho_lsulp]: AmountUsd('0'),
                    [ActivityId.fl_ho_xrd]: AmountUsd('0'),
                    [ActivityId.fl_ho_xrdfusd]: AmountUsd('0'),
                    [ActivityId.fl_ho_lsulpfusd]: AmountUsd('0'),
                    ...cdpPositions,
                    ...reservoirPositions,
                  });
                }),
            );
          }),
      };
    }),
  },
) {
  static readonly nftResourceAddress = NonFungibleResourceAddress(
    DappConstants.Flux.constants.receiptResourceAddress,
  );
  static readonly cdpPositions = R.fromEntries([
    [FungibleResourceAddress(Assets.Fungible.XRD), ActivityId.fl_ho_xrd],
    [FungibleResourceAddress(Assets.Fungible.LSULP), ActivityId.fl_ho_lsulp],
  ]);
  static readonly reservoirPositions = R.fromEntries([
    [FungibleResourceAddress(Assets.Fungible.XRD), ActivityId.fl_ho_xrdfusd],
    [
      FungibleResourceAddress(Assets.Fungible.LSULP),
      ActivityId.fl_ho_lsulpfusd,
    ],
  ]);
}

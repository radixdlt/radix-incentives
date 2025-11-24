import { BigNumber } from 'bignumber.js';
import {
  ActivityId,
  Assets,
  DappConstants,
  WeftFinanceConstants,
  weftFungibleRecourceAddresses,
} from 'data';
import {
  Array as A,
  Data,
  Effect,
  flow,
  HashMap,
  Option,
  Record as R,
} from 'effect';
import { reduce } from 'effect/Array';
import {
  LendingPoolSchema,
  SingleResourcePool,
} from '../../../../../common/dapps/weftFinance/schemas';
import {
  GetComponentStateService,
  GetKeyValueStoreService,
} from '../../../../../common/gateway';
import { GetUsdValueService } from '../../../../token-price/getUsdValue';
import { AccountBalanceState } from '../../accountBalanceState';
import {
  type AccountAddress,
  Amount,
  AmountUsd,
  FungibleResourceAddress,
} from '../../schemas';
import { WeftCollateral } from './weftCollateral';

class FailedToParseLendingPoolSchemaError extends Data.TaggedError(
  'FailedToParseLendingPoolSchemaError',
)<{ error: unknown }> {}

export class WeftFinancePosition extends Effect.Service<WeftFinancePosition>()(
  'WeftFinancePosition',
  {
    dependencies: [
      GetKeyValueStoreService.Default,
      GetComponentStateService.Default,
      GetUsdValueService.Default,
    ],
    effect: Effect.gen(function* () {
      const getKeyValueStoreService = yield* GetKeyValueStoreService;
      const getComponentStateService = yield* GetComponentStateService;
      const getUsdValueService = yield* GetUsdValueService;

      // WEFT V1 Lending pool KVS contains the unit to asset ratio for each asset
      const getV1PoolToUnitToAssetRatio = (stateVersion: number) =>
        getComponentStateService
          .run({
            addresses: [
              WeftFinanceConstants.v1.wLSULP.componentAddress,
              WeftFinanceConstants.v1.wXRD.componentAddress,
              WeftFinanceConstants.v1.wxUSDC.componentAddress,
            ],
            schema: SingleResourcePool,
            at_ledger_state: { state_version: stateVersion },
          })
          .pipe(
            Effect.map(
              reduce(
                HashMap.empty<FungibleResourceAddress, Amount>(),
                (acc, item) => {
                  const resourceAddress = FungibleResourceAddress(
                    item.state.pool_unit_res_manager,
                  );
                  const amount = Amount(item.state.unit_to_asset_ratio);
                  return HashMap.set(acc, resourceAddress, amount);
                },
              ),
            ),
          );

      // WEFT V2 Lending pool KVS contains the unit to asset ratio for each asset
      const getV2PoolToUnitToAssetRatio = (stateVersion: number) =>
        getKeyValueStoreService({
          address: WeftFinanceConstants.v2.lendingPool.kvsAddress,
          at_ledger_state: {
            state_version: stateVersion,
          },
        }).pipe(
          Effect.flatMap(
            flow(
              ({ entries }) => entries,
              Effect.reduce(
                HashMap.empty<FungibleResourceAddress, Amount>(),
                (acc, item) =>
                  Effect.gen(function* () {
                    const lendingPoolResult = LendingPoolSchema.safeParse(
                      item.value.programmatic_json,
                    );

                    if (lendingPoolResult.isErr()) {
                      return yield* new FailedToParseLendingPoolSchemaError({
                        error: lendingPoolResult.error,
                      });
                    }

                    const lendingPool = lendingPoolResult.value;

                    const resourseAddress = FungibleResourceAddress(
                      lendingPool.deposit_unit_res_address,
                    );
                    const amount = Amount(lendingPool.deposit_state.unit_ratio);

                    return HashMap.set(acc, resourseAddress, amount);
                  }),
              ),
            ),
          ),
        );

      const createUnitToAssetRatioMap = (stateVersion: number) =>
        Effect.all([
          getV1PoolToUnitToAssetRatio(stateVersion),
          getV2PoolToUnitToAssetRatio(stateVersion),
        ]).pipe(Effect.map(([v1, v2]) => HashMap.union(v1, v2)));

      // Supported wrapped fungible resource addresses
      const wrappedAssets = [
        ...DappConstants.WeftFinance.weftFungibleRecourceAddresses.keys(),
      ].map(FungibleResourceAddress);

      return {
        fromState: (input: {
          addresses: AccountAddress[];
          stateVersion: number;
          timestamp: Date;
        }) =>
          Effect.gen(function* () {
            const getFungibleBalance =
              yield* AccountBalanceState.createGetFungibleTokenBalanceFn;

            const weftCollateral = yield* WeftCollateral;

            const unitToAssetRatioMap = yield* createUnitToAssetRatioMap(
              input.stateVersion,
            );

            const unwrapAsset = (
              wrappedResourceAddress: FungibleResourceAddress,
              amount: BigNumber,
            ) =>
              Effect.gen(function* () {
                const unwrappedResourceAddress =
                  weftFungibleRecourceAddresses.get(wrappedResourceAddress);

                // unsupported resource address
                if (!unwrappedResourceAddress) return;

                const unitToAssetRatio = HashMap.get(
                  unitToAssetRatioMap,
                  wrappedResourceAddress,
                ).pipe(Option.getOrElse(() => '0'));

                if (unitToAssetRatio === '0')
                  return {
                    resourceAddress: FungibleResourceAddress(
                      unwrappedResourceAddress,
                    ),
                    amount: Amount('0'),
                  };

                return {
                  resourceAddress: FungibleResourceAddress(
                    unwrappedResourceAddress,
                  ),
                  amount: Amount(amount.div(unitToAssetRatio).toString()),
                };
              });

            const getWrappedResourceFromAccount = (
              accountAddress: AccountAddress,
              wrappedResourceAddress: FungibleResourceAddress,
            ) =>
              getFungibleBalance(accountAddress, wrappedResourceAddress).pipe(
                Option.match({
                  onNone: () => new BigNumber(0),
                  onSome: (amount) => new BigNumber(amount),
                }),
              );

            const getUsdValueFromRecord = <
              R extends Record<FungibleResourceAddress, Amount>,
            >(
              record: R,
              resourceAddress: string,
            ) => {
              const amount = R.get(
                record,
                FungibleResourceAddress(resourceAddress),
              ).pipe(Option.getOrElse(() => AmountUsd('0')));

              return getUsdValueService({
                amount,
                resourceAddress: FungibleResourceAddress(resourceAddress),
                timestamp: input.timestamp,
              }).pipe(
                Effect.map((usdValue) =>
                  AmountUsd(usdValue.decimalPlaces(2).toString()),
                ),
              );
            };

            const getLendingPositions = ({
              accountAddress,
              fungibleCollaterals,
              timestamp,
            }: {
              accountAddress: AccountAddress;
              fungibleCollaterals: Record<FungibleResourceAddress, Amount>;
              timestamp: Date;
            }) =>
              Effect.reduce(
                wrappedAssets,
                R.empty<ActivityId, AmountUsd>(),
                (acc, wrappedAssetAddress) =>
                  Effect.gen(function* () {
                    const wrappedResourceFromAccount =
                      getWrappedResourceFromAccount(
                        accountAddress,
                        wrappedAssetAddress,
                      );
                    const wrappedResourceFromCollateral = R.get(
                      fungibleCollaterals,
                      wrappedAssetAddress,
                    ).pipe(Option.getOrElse(() => Amount('0')));

                    const unwrappedAsset = yield* unwrapAsset(
                      wrappedAssetAddress,
                      wrappedResourceFromAccount.plus(
                        wrappedResourceFromCollateral,
                      ),
                    );

                    if (!unwrappedAsset) return acc;

                    const activityId = R.get(
                      WeftFinancePosition.resourceAddressToActivityIdMap,
                      unwrappedAsset.resourceAddress,
                    );

                    if (Option.isNone(activityId)) return acc;

                    const usdValue = yield* getUsdValueService({
                      amount: unwrappedAsset.amount,
                      resourceAddress: unwrappedAsset.resourceAddress,
                      timestamp,
                    }).pipe(
                      Effect.map((usdValue) =>
                        AmountUsd(usdValue.decimalPlaces(2).toString()),
                      ),
                    );

                    return R.union(
                      acc,
                      { [activityId.value]: usdValue },
                      (a, b) => AmountUsd(new BigNumber(a).plus(b).toString()),
                    );
                  }),
              );

            // Note that LSU and Unstaking are handled in staked positions
            const getCollateralPositions = (
              fungibleCollaterals: Record<FungibleResourceAddress, Amount>,
            ) =>
              Effect.reduce(
                R.toEntries(WeftFinancePosition.holdingPositions),
                R.empty<ActivityId, AmountUsd>(),
                (acc, [resourceAddress, activityId]) =>
                  Effect.gen(function* () {
                    const usdValue = yield* getUsdValueFromRecord(
                      fungibleCollaterals,
                      resourceAddress,
                    );
                    return R.set(acc, activityId, usdValue);
                  }),
              );

            return yield* Effect.reduce(
              input.addresses,
              R.empty<AccountAddress, Record<string, AmountUsd>>(),
              (acc, accountAddress) =>
                Effect.gen(function* () {
                  const { fungibleCollaterals } =
                    yield* weftCollateral.getWeftV2CollateralsFromState(
                      accountAddress,
                    );

                  const lendingPositions = yield* getLendingPositions({
                    accountAddress,
                    fungibleCollaterals,
                    timestamp: input.timestamp,
                  });

                  const collateralPositions =
                    yield* getCollateralPositions(fungibleCollaterals);

                  const holdingPositions = A.reduce(
                    R.toEntries(
                      WeftFinancePosition.holdingPositionsFromLending,
                    ),
                    R.empty<ActivityId, AmountUsd>(),
                    (acc, [holdingActivityId, lendingActivityId]) => {
                      const collateralAmountUsd = R.get(
                        collateralPositions,
                        holdingActivityId,
                      );
                      const lendingAmountUsd = R.get(
                        lendingPositions,
                        lendingActivityId,
                      );

                      let value = new BigNumber(0);
                      if (Option.isSome(collateralAmountUsd)) {
                        value = value.plus(collateralAmountUsd.value);
                      }
                      if (Option.isSome(lendingAmountUsd)) {
                        value = value.plus(lendingAmountUsd.value);
                      }
                      return R.set(
                        acc,
                        holdingActivityId,
                        AmountUsd(value.toString()),
                      );
                    },
                  );

                  return R.set(acc, accountAddress, {
                    ...holdingPositions,
                    ...lendingPositions,
                  });
                }),
            );
          }).pipe(Effect.provide(WeftCollateral.Default)),
      };
    }),
  },
) {
  static resourceAddressToActivityIdMap = R.mapKeys(
    {
      // Stables
      [Assets.Fungible.xUSDC]: ActivityId.we_le_sta_xusdc,
      [Assets.Fungible.xUSDT]: ActivityId.we_le_sta_xusdt,
      [Assets.Fungible.hUSDC]: ActivityId.we_le_sta_husdc,
      [Assets.Fungible.hUSDT]: ActivityId.we_le_sta_husdt,
      // Blue chips
      [Assets.Fungible.wxBTC]: ActivityId.we_le_blu_xwbtc,
      [Assets.Fungible.xETH]: ActivityId.we_le_blu_xeth,
      [Assets.Fungible.hwBTC]: ActivityId.we_le_blu_hwbtc,
      [Assets.Fungible.hETH]: ActivityId.we_le_blu_heth,
      [Assets.Fungible.hSOL]: ActivityId.we_le_blu_hsol,
      // XRD derivatives
      [Assets.Fungible.XRD]: ActivityId.we_le_der_xrd,
      [Assets.Fungible.LSULP]: ActivityId.we_le_der_lsulp,
    },
    (key) => FungibleResourceAddress(key),
  );
  static holdingPositions = R.mapKeys(
    {
      [Assets.Fungible.XRD]: ActivityId.we_ho_xrd,
      [Assets.Fungible.LSULP]: ActivityId.we_ho_lsulp,
    },
    (key) => FungibleResourceAddress(key),
  );
  static holdingPositionsFromLending = R.fromEntries([
    [ActivityId.we_ho_lsulp, ActivityId.we_le_der_lsulp],
    [ActivityId.we_ho_xrd, ActivityId.we_le_der_xrd],
  ]);
  static nftResourceAddress = WeftCollateral.WeftyV2ResourceAddress;
}

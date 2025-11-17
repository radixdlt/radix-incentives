import { BigNumber } from 'bignumber.js';
import { ActivityId, Assets, RootFinanceConstants } from 'data';
import { Array as A, Effect, Option, pipe, Record as R } from 'effect';
import s from 'sbor-ez-mode';
import {
  GetComponentStateService,
  GetKeyValueStoreService,
} from '../../../../../common/gateway';
import { GetUsdValueService } from '../../../../token-price/getUsdValue';
import { AccountBalanceState } from '../../accountBalanceState';
import { parseAddress, parseSbor } from '../../helpers/parseSbor';
import {
  type AccountAddress,
  Amount,
  AmountUsd,
  FungibleResourceAddress,
  NonFungibleResourceAddress,
  type StateVersion,
} from '../../schemas';

export const CdpData = s.struct({
  collaterals: s.map({ key: s.address(), value: s.decimal() }),
});

export const LendingPoolState = s.struct({
  total_deposit: s.decimal(),
  total_deposit_unit: s.decimal(),
});

export class RootFinancePosition extends Effect.Service<RootFinancePosition>()(
  'RootFinancePosition',
  {
    dependencies: [
      GetKeyValueStoreService.Default,
      GetComponentStateService.Default,
      GetUsdValueService.Default,
    ],
    effect: Effect.gen(function* () {
      const getKeyValueStoreService = yield* GetKeyValueStoreService;
      const getUsdValueService = yield* GetUsdValueService;

      const getPoolStatesKvs = (stateVersion: StateVersion) =>
        getKeyValueStoreService({
          address: RootFinanceConstants.poolStateKvs,
          at_ledger_state: { state_version: stateVersion },
        }).pipe(
          Effect.catchTags({
            EntityNotFoundError: () =>
              Effect.succeed({
                entries: [],
              }),
          }),
        );

      const createPoolUnitRatioMap = (stateVersion: StateVersion) =>
        Effect.gen(function* () {
          const poolStatesKvs = yield* getPoolStatesKvs(stateVersion);

          return yield* Effect.forEach(poolStatesKvs.entries, (item) =>
            Effect.gen(function* () {
              const resourceAddress = yield* parseAddress(
                item.key.programmatic_json,
              ).pipe(Effect.map(FungibleResourceAddress));

              const poolUnitRatio = yield* parseSbor(
                LendingPoolState,
                item.value.programmatic_json,
              ).pipe(
                Effect.map((item) => {
                  const totalDepositUnit = new BigNumber(
                    item.total_deposit_unit,
                  );
                  const totalDeposit = new BigNumber(item.total_deposit);
                  if (totalDepositUnit.gt(0))
                    return totalDeposit.div(totalDepositUnit);
                }),
              );

              return {
                resourceAddress,
                poolUnitRatio,
              };
            }),
          ).pipe(
            Effect.map(
              A.reduce(
                R.empty<FungibleResourceAddress, BigNumber>(),
                (acc, item) => {
                  if (item.poolUnitRatio) {
                    return R.set(acc, item.resourceAddress, item.poolUnitRatio);
                  }
                  return acc;
                },
              ),
            ),
          );
        });

      return {
        fromState: (input: {
          addresses: AccountAddress[];
          stateVersion: StateVersion;
          timestamp: Date;
        }) =>
          Effect.gen(function* () {
            const getNftCollection =
              yield* AccountBalanceState.createGetNftCollectionFn;

            const poolUnitRatioMap = yield* createPoolUnitRatioMap(
              input.stateVersion,
            );

            const getCollateralPositions = (accountAddress: AccountAddress) =>
              Effect.gen(function* () {
                const collaterals = yield* getNftCollection(
                  accountAddress,
                  RootFinancePosition.nftResourceAddress,
                  CdpData,
                ).pipe(
                  Effect.map((item) => item.map((item) => item.collaterals)),
                );

                const aggregatedCollaterals = A.reduce(
                  collaterals,
                  R.empty<FungibleResourceAddress, Amount>(),
                  (acc, item) => {
                    const amount = pipe(
                      R.fromEntries(item),
                      R.mapEntries((value, key) =>
                        R.get(
                          poolUnitRatioMap,
                          FungibleResourceAddress(key),
                        ).pipe(
                          Option.match({
                            onNone: () => [
                              FungibleResourceAddress(key),
                              Amount('0'),
                            ],
                            onSome: (poolUnitRatio) => [
                              FungibleResourceAddress(key),
                              Amount(
                                poolUnitRatio.multipliedBy(value).toString(),
                              ),
                            ],
                          }),
                        ),
                      ),
                    );

                    return R.union(acc, amount, (a, b) =>
                      Amount(new BigNumber(a).plus(b).toString()),
                    );
                  },
                );

                return yield* Effect.reduce(
                  R.toEntries(RootFinancePosition.supportedLendingPositions),
                  R.empty<ActivityId, AmountUsd>(),
                  (acc, [resourceAddress, activityId]) =>
                    Effect.gen(function* () {
                      const position = R.get(
                        aggregatedCollaterals,
                        resourceAddress,
                      );

                      if (Option.isNone(position)) return acc;

                      const usdValue = yield* getUsdValueService({
                        amount: position.value,
                        resourceAddress,
                        timestamp: input.timestamp,
                      }).pipe(
                        Effect.map((value) =>
                          AmountUsd(value.decimalPlaces(2).toString()),
                        ),
                      );

                      return R.set(acc, activityId, usdValue);
                    }),
                );
              });

            return yield* Effect.reduce(
              input.addresses,
              R.empty<AccountAddress, Record<string, AmountUsd>>(),
              (acc, accountAddress) =>
                Effect.gen(function* () {
                  const collateralPositions =
                    yield* getCollateralPositions(accountAddress);

                  const holdingPositions = A.reduce(
                    R.toEntries(RootFinancePosition.supportedHoldingPositions),
                    R.empty<ActivityId, AmountUsd>(),
                    (acc, [lendingActivityId, holdingActivityId]) => {
                      const usdValue = R.get(
                        collateralPositions,
                        lendingActivityId,
                      );
                      if (Option.isNone(usdValue))
                        return R.set(acc, lendingActivityId, AmountUsd('0'));
                      return R.set(acc, holdingActivityId, usdValue.value);
                    },
                  );

                  return R.set(acc, accountAddress, {
                    ...holdingPositions,
                    ...collateralPositions,
                  });
                }),
            );
          }),
      };
    }),
  },
) {
  static supportedLendingPositions = R.mapKeys(
    {
      // Stables
      [Assets.Fungible.xUSDC]: ActivityId.ro_le_sta_xusdt,
      [Assets.Fungible.xUSDT]: ActivityId.ro_le_sta_xusdt,
      [Assets.Fungible.hUSDC]: ActivityId.ro_le_sta_husdc,
      [Assets.Fungible.hUSDT]: ActivityId.ro_le_sta_husdt,
      // Blue chips
      [Assets.Fungible.wxBTC]: ActivityId.ro_le_blu_xwbtc,
      [Assets.Fungible.xETH]: ActivityId.ro_le_blu_xeth,
      [Assets.Fungible.hwBTC]: ActivityId.ro_le_blu_hwbtc,
      [Assets.Fungible.hETH]: ActivityId.ro_le_blu_heth,
      // XRD derivatives
      [Assets.Fungible.XRD]: ActivityId.ro_le_der_xrd,
      [Assets.Fungible.LSULP]: ActivityId.ro_le_der_lsulp,
    },
    (key) => FungibleResourceAddress(key),
  );

  static supportedHoldingPositions = R.fromEntries([
    [ActivityId.ro_le_der_xrd, ActivityId.ro_ho_xrd],
    [ActivityId.ro_le_der_lsulp, ActivityId.ro_ho_lsulp],
  ]);

  static nftResourceAddress = NonFungibleResourceAddress(
    RootFinanceConstants.receiptResourceAddress,
  );
}

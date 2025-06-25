import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import { Assets } from "../../common/assets/constants";
import { CaviarNineConstants } from "../../common/dapps/caviarnine/constants";
import { DefiPlaza } from "../../common/dapps/defiplaza/constants";
import {
  TokenNameService,
  type UnknownTokenError,
} from "../../common/token-name/getTokenName";

import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import type { AccountBalanceData, ActivityId } from "db/incentives";

export type XrdBalanceInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type XrdBalanceOutput = AccountBalanceData;

export class XrdBalanceService extends Context.Tag("XrdBalanceService")<
  XrdBalanceService,
  (
    input: XrdBalanceInput
  ) => Effect.Effect<
    XrdBalanceOutput[],
    GetUsdValueServiceError | UnknownTokenError,
    GetUsdValueService | TokenNameService
  >
>() {}

export const XrdBalanceLive = Layer.effect(
  XrdBalanceService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    const tokenNameService = yield* TokenNameService;
    return (input) =>
      Effect.gen(function* () {
        const output: AccountBalanceData[] = [];

        const xrdToUsdValue = (amount: BigNumber) =>
          getUsdValueService({
            amount,
            resourceAddress: Assets.Fungible.XRD,
            timestamp: input.timestamp,
          }).pipe(Effect.map((usdValue) => usdValue.toString()));

        const xrd =
          input.accountBalance.fungibleTokenBalances.find(
            (resource) => resource.resourceAddress === Assets.Fungible.XRD
          )?.amount ?? new BigNumber(0);

        output.push({
          activityId: "hold_xrd",
          usdValue: yield* xrdToUsdValue(xrd),
        });

        const stakedXrd = input.accountBalance.staked.reduce(
          (acc, item) => acc.plus(item.xrdAmount),
          new BigNumber(0)
        );

        output.push({
          activityId: "hold_stakedXrd",
          usdValue: yield* xrdToUsdValue(stakedXrd),
        });

        const unstakedXrd = input.accountBalance.unstaked.reduce(
          (acc, item) => acc.plus(item.amount),
          new BigNumber(0)
        );

        output.push({
          activityId: "hold_unstakedXrd",
          usdValue: yield* xrdToUsdValue(unstakedXrd),
        });

        const lsulp = input.accountBalance.lsulp.amount.multipliedBy(
          input.accountBalance.lsulp.lsulpValue
        );

        output.push({
          activityId: "hold_lsulp",
          usdValue: yield* xrdToUsdValue(lsulp),
        });

        const rootFinanceLending =
          input.accountBalance.rootFinancePositions.reduce(
            (acc, position) => {
              // Check XRD collaterals
              if (position.collaterals?.[Assets.Fungible.XRD]) {
                acc.xrd = acc.xrd.plus(
                  position.collaterals[Assets.Fungible.XRD] ?? 0
                );
              }

              // Check LSULP collaterals
              if (
                position.collaterals?.[
                  CaviarNineConstants.LSULP.resourceAddress
                ]
              ) {
                acc.lsulp = acc.lsulp.plus(
                  position.collaterals[
                    CaviarNineConstants.LSULP.resourceAddress
                  ] ?? 0
                );
              }

              return acc;
            },
            { xrd: new BigNumber(0), lsulp: new BigNumber(0) }
          ) ?? { xrd: new BigNumber(0), lsulp: new BigNumber(0) };

        output.push({
          activityId: "root_hold_xrd",
          usdValue: yield* xrdToUsdValue(rootFinanceLending.xrd),
        });

        output.push({
          activityId: "root_hold_lsulp",
          usdValue: yield* xrdToUsdValue(rootFinanceLending.lsulp),
        });

        const weftFinanceLending =
          input.accountBalance.weftFinancePositions.reduce(
            (acc, position) => {
              if (
                position.unwrappedAsset.resourceAddress === Assets.Fungible.XRD
              ) {
                acc.xrd = acc.xrd.plus(position.unwrappedAsset.amount);
              }

              if (
                position.unwrappedAsset.resourceAddress ===
                CaviarNineConstants.LSULP.resourceAddress
              ) {
                acc.lsulp = acc.lsulp.plus(position.unwrappedAsset.amount);
              }

              return acc;
            },
            { xrd: new BigNumber(0), lsulp: new BigNumber(0) }
          ) ?? { xrd: new BigNumber(0), lsulp: new BigNumber(0) };

        output.push({
          activityId: "weft_hold_xrd",
          usdValue: yield* xrdToUsdValue(weftFinanceLending.xrd),
        });

        output.push({
          activityId: "weft_hold_lsulp",
          usdValue: yield* xrdToUsdValue(weftFinanceLending.lsulp),
        });

        // Process CaviarNine positions by pool
        const caviarNineByPool = new Map<ActivityId, BigNumber>();

        for (const [_poolKey, poolAssets] of Object.entries(
          input.accountBalance.caviarninePositions
        )) {
          const poolXrd = poolAssets.reduce((currentXrd, item) => {
            let newXrd = currentXrd;
            // Only count XRD tokens from either xToken or yToken
            if (item.xToken.resourceAddress === Assets.Fungible.XRD) {
              newXrd = newXrd
                .plus(item.xToken.withinPriceBounds)
                .plus(item.xToken.outsidePriceBounds);
            }
            if (item.yToken.resourceAddress === Assets.Fungible.XRD) {
              newXrd = newXrd
                .plus(item.yToken.withinPriceBounds)
                .plus(item.yToken.outsidePriceBounds);
            }
            return newXrd;
          }, new BigNumber(0));

          if (poolAssets.length > 0) {
            const firstAsset = poolAssets[0];
            if (firstAsset) {
              const { xToken, yToken } = firstAsset;

              // Determine which tokens are XRD and which are not
              const isXTokenXrd =
                xToken.resourceAddress === Assets.Fungible.XRD;
              const isYTokenXrd =
                yToken.resourceAddress === Assets.Fungible.XRD;

              if (isXTokenXrd || isYTokenXrd) {
                const nonXrdToken = isXTokenXrd ? yToken : xToken;
                const nonXrdTokenName = yield* tokenNameService(
                  nonXrdToken.resourceAddress
                );
                const xrdTokenName = yield* tokenNameService(
                  Assets.Fungible.XRD
                );
                const activityId =
                  `c9_hold_${xrdTokenName}-${nonXrdTokenName}` as ActivityId;

                const currentAmount =
                  caviarNineByPool.get(activityId) ?? new BigNumber(0);
                caviarNineByPool.set(activityId, currentAmount.plus(poolXrd));
              }
            }
          }
        }

        // Add results for each CaviarNine pool
        for (const [activityId, xrdAmount] of caviarNineByPool.entries()) {
          output.push({
            activityId,
            usdValue: yield* xrdToUsdValue(xrdAmount),
          });
        }

        // Add zero entries for CaviarNine pools that contain XRD but have no positions
        for (const pool of Object.values(
          CaviarNineConstants.shapeLiquidityPools
        )) {
          // Only process pools that have XRD as one of the tokens
          if (
            pool.token_x === Assets.Fungible.XRD ||
            pool.token_y === Assets.Fungible.XRD
          ) {
            const nonXrdTokenAddress =
              pool.token_x === Assets.Fungible.XRD
                ? pool.token_y
                : pool.token_x;
            const nonXrdTokenName = yield* tokenNameService(nonXrdTokenAddress);
            const xrdTokenName = yield* tokenNameService(Assets.Fungible.XRD);
            const activityId =
              `c9_hold_${xrdTokenName}-${nonXrdTokenName}` as ActivityId;

            if (!caviarNineByPool.has(activityId)) {
              output.push({
                activityId,
                usdValue: yield* xrdToUsdValue(new BigNumber(0)),
              });
            }
          }
        }

        // Process DefiPlaza positions by pool
        const defiPlazaByPool = new Map<ActivityId, BigNumber>();

        for (const lpPosition of input.accountBalance.defiPlazaPositions
          .items) {
          // Find XRD and non-XRD positions
          const xrdPosition = lpPosition.position.find(
            (pos) => pos.resourceAddress === Assets.Fungible.XRD
          );
          const nonXrdPosition = lpPosition.position.find(
            (pos) => pos.resourceAddress !== Assets.Fungible.XRD
          );

          if (xrdPosition && nonXrdPosition) {
            // Find which DefiPlaza pool this corresponds to
            const pool = Object.values(DefiPlaza).find(
              (p) => p.lpResourceAddress === lpPosition.lpResourceAddress
            );

            if (pool) {
              const nonXrdTokenAddress =
                (pool.baseResourceAddress as string) === Assets.Fungible.XRD
                  ? pool.quoteResourceAddress
                  : pool.baseResourceAddress;
              const nonXrdTokenName =
                yield* tokenNameService(nonXrdTokenAddress);
              const xrdTokenName = yield* tokenNameService(Assets.Fungible.XRD);
              const activityId =
                `defiPlaza_hold_${xrdTokenName}-${nonXrdTokenName}` as ActivityId;

              const currentAmount =
                defiPlazaByPool.get(activityId) ?? new BigNumber(0);
              defiPlazaByPool.set(
                activityId,
                currentAmount.plus(xrdPosition.amount)
              );
            }
          }
        }

        // Add results for each pool
        for (const [activityId, xrdAmount] of defiPlazaByPool.entries()) {
          output.push({
            activityId,
            usdValue: yield* xrdToUsdValue(xrdAmount),
          });
        }

        // Add zero entries for DefiPlaza pools that contain XRD but have no positions
        for (const pool of Object.values(DefiPlaza)) {
          // Only process pools that have XRD as one of the tokens
          if (
            (pool.baseResourceAddress as string) === Assets.Fungible.XRD ||
            (pool.quoteResourceAddress as string) === Assets.Fungible.XRD
          ) {
            const nonXrdTokenAddress =
              (pool.baseResourceAddress as string) === Assets.Fungible.XRD
                ? pool.quoteResourceAddress
                : pool.baseResourceAddress;
            const nonXrdTokenName = yield* tokenNameService(nonXrdTokenAddress);
            const xrdTokenName = yield* tokenNameService(Assets.Fungible.XRD);
            const activityId =
              `defiPlaza_hold_${xrdTokenName}-${nonXrdTokenName}` as ActivityId;

            if (!defiPlazaByPool.has(activityId)) {
              output.push({
                activityId,
                usdValue: yield* xrdToUsdValue(new BigNumber(0)),
              });
            }
          }
        }

        return output;
      });
  })
);

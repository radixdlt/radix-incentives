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

// Helper function to check if a resource address is XRD or LSULP
const isXrdOrLsulp = (resourceAddress: string): boolean => {
  return (
    resourceAddress === Assets.Fungible.XRD ||
    resourceAddress === CaviarNineConstants.LSULP.resourceAddress
  );
};

// Helper function to convert LSULP amount to XRD equivalent
const convertLsulpToXrd = (
  amount: BigNumber,
  lsulpValue: BigNumber
): BigNumber => {
  return amount.multipliedBy(lsulpValue);
};

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

        const lsulpXrdEquivalent = convertLsulpToXrd(
          input.accountBalance.lsulp.amount,
          input.accountBalance.lsulp.lsulpValue
        );

        output.push({
          activityId: "hold_lsulp",
          usdValue: yield* xrdToUsdValue(lsulpXrdEquivalent),
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

              // Check LSULP collaterals and convert to XRD equivalent
              const lsulpCollateral =
                position.collaterals?.[
                  CaviarNineConstants.LSULP.resourceAddress
                ];
              if (lsulpCollateral) {
                const lsulpXrdEquivalent = convertLsulpToXrd(
                  new BigNumber(lsulpCollateral),
                  input.accountBalance.lsulp.lsulpValue
                );
                acc.lsulp = acc.lsulp.plus(lsulpXrdEquivalent);
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
                const lsulpXrdEquivalent = convertLsulpToXrd(
                  position.unwrappedAsset.amount,
                  input.accountBalance.lsulp.lsulpValue
                );
                acc.lsulp = acc.lsulp.plus(lsulpXrdEquivalent);
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
          const poolXrdDerivatives = poolAssets.reduce((currentXrd, item) => {
            let newXrd = currentXrd;
            // Count both XRD and LSULP tokens from either xToken or yToken
            if (isXrdOrLsulp(item.xToken.resourceAddress)) {
              let tokenAmount = new BigNumber(
                item.xToken.withinPriceBounds
              ).plus(new BigNumber(item.xToken.outsidePriceBounds));
              // Convert LSULP to XRD equivalent if needed
              if (
                item.xToken.resourceAddress ===
                CaviarNineConstants.LSULP.resourceAddress
              ) {
                tokenAmount = convertLsulpToXrd(
                  tokenAmount,
                  input.accountBalance.lsulp.lsulpValue
                );
              }
              newXrd = newXrd.plus(tokenAmount);
            }
            if (isXrdOrLsulp(item.yToken.resourceAddress)) {
              let tokenAmount = new BigNumber(
                item.yToken.withinPriceBounds
              ).plus(new BigNumber(item.yToken.outsidePriceBounds));
              // Convert LSULP to XRD equivalent if needed
              if (
                item.yToken.resourceAddress ===
                CaviarNineConstants.LSULP.resourceAddress
              ) {
                tokenAmount = convertLsulpToXrd(
                  tokenAmount,
                  input.accountBalance.lsulp.lsulpValue
                );
              }
              newXrd = newXrd.plus(tokenAmount);
            }
            return newXrd;
          }, new BigNumber(0));

          if (poolAssets.length > 0) {
            const firstAsset = poolAssets[0];
            if (firstAsset) {
              const { xToken, yToken } = firstAsset;

              // Determine which tokens are XRD derivatives and which are not
              const isXTokenXrdDerivative = isXrdOrLsulp(
                xToken.resourceAddress
              );
              const isYTokenXrdDerivative = isXrdOrLsulp(
                yToken.resourceAddress
              );

              if (isXTokenXrdDerivative || isYTokenXrdDerivative) {
                const nonXrdDerivativeToken = isXTokenXrdDerivative
                  ? yToken
                  : xToken;
                const xrdDerivativeToken = isXTokenXrdDerivative
                  ? xToken
                  : yToken;

                const nonXrdDerivativeTokenName = yield* tokenNameService(
                  nonXrdDerivativeToken.resourceAddress
                );
                const xrdDerivativeTokenName = yield* tokenNameService(
                  xrdDerivativeToken.resourceAddress
                );
                const activityId =
                  `c9_hold_${xrdDerivativeTokenName}-${nonXrdDerivativeTokenName}` as ActivityId;

                const currentAmount =
                  caviarNineByPool.get(activityId) ?? new BigNumber(0);
                caviarNineByPool.set(
                  activityId,
                  currentAmount.plus(poolXrdDerivatives)
                );
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

        // Add zero entries for CaviarNine pools that contain XRD derivatives but have no positions
        for (const pool of Object.values(
          CaviarNineConstants.shapeLiquidityPools
        )) {
          // Only process pools that have XRD or LSULP as one of the tokens
          const isToken1XrdDerivative = isXrdOrLsulp(pool.token_x);
          const isToken2XrdDerivative = isXrdOrLsulp(pool.token_y);

          if (isToken1XrdDerivative || isToken2XrdDerivative) {
            const nonXrdDerivativeTokenAddress = isToken1XrdDerivative
              ? pool.token_y
              : pool.token_x;
            const xrdDerivativeTokenAddress = isToken1XrdDerivative
              ? pool.token_x
              : pool.token_y;

            const nonXrdDerivativeTokenName = yield* tokenNameService(
              nonXrdDerivativeTokenAddress
            );
            const xrdDerivativeTokenName = yield* tokenNameService(
              xrdDerivativeTokenAddress
            );
            const activityId =
              `c9_hold_${xrdDerivativeTokenName}-${nonXrdDerivativeTokenName}` as ActivityId;

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
          // Find XRD derivative and non-XRD derivative positions
          const xrdDerivativePosition = lpPosition.position.find((pos) =>
            isXrdOrLsulp(pos.resourceAddress)
          );
          const nonXrdDerivativePosition = lpPosition.position.find(
            (pos) => !isXrdOrLsulp(pos.resourceAddress)
          );

          if (xrdDerivativePosition && nonXrdDerivativePosition) {
            // Find which DefiPlaza pool this corresponds to
            const pool = Object.values(DefiPlaza).find(
              (p) => p.lpResourceAddress === lpPosition.lpResourceAddress
            );

            if (
              pool &&
              (isXrdOrLsulp(pool.baseResourceAddress) ||
                isXrdOrLsulp(pool.quoteResourceAddress))
            ) {
              const isBaseXrdDerivative = isXrdOrLsulp(
                pool.baseResourceAddress
              );
              const nonXrdDerivativeTokenAddress = isBaseXrdDerivative
                ? pool.quoteResourceAddress
                : pool.baseResourceAddress;
              const xrdDerivativeTokenAddress = isBaseXrdDerivative
                ? pool.baseResourceAddress
                : pool.quoteResourceAddress;

              const nonXrdDerivativeTokenName = yield* tokenNameService(
                nonXrdDerivativeTokenAddress
              );
              const xrdDerivativeTokenName = yield* tokenNameService(
                xrdDerivativeTokenAddress
              );
              const activityId =
                `defiPlaza_hold_${xrdDerivativeTokenName}-${nonXrdDerivativeTokenName}` as ActivityId;

              const currentAmount =
                defiPlazaByPool.get(activityId) ?? new BigNumber(0);

              // Convert LSULP to XRD equivalent if needed
              let xrdDerivativeAmount = xrdDerivativePosition.amount;
              if (
                xrdDerivativePosition.resourceAddress ===
                CaviarNineConstants.LSULP.resourceAddress
              ) {
                xrdDerivativeAmount = convertLsulpToXrd(
                  xrdDerivativePosition.amount,
                  input.accountBalance.lsulp.lsulpValue
                );
              }

              defiPlazaByPool.set(
                activityId,
                currentAmount.plus(xrdDerivativeAmount)
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

        // Add zero entries for DefiPlaza pools that contain XRD derivatives but have no positions
        for (const pool of Object.values(DefiPlaza)) {
          // Only process pools that have XRD or LSULP as one of the tokens
          const isBaseXrdDerivative = isXrdOrLsulp(pool.baseResourceAddress);
          const isQuoteXrdDerivative = isXrdOrLsulp(pool.quoteResourceAddress);

          if (isBaseXrdDerivative || isQuoteXrdDerivative) {
            const nonXrdDerivativeTokenAddress = isBaseXrdDerivative
              ? pool.quoteResourceAddress
              : pool.baseResourceAddress;
            const xrdDerivativeTokenAddress = isBaseXrdDerivative
              ? pool.baseResourceAddress
              : pool.quoteResourceAddress;

            const nonXrdDerivativeTokenName = yield* tokenNameService(
              nonXrdDerivativeTokenAddress
            );
            const xrdDerivativeTokenName = yield* tokenNameService(
              xrdDerivativeTokenAddress
            );
            const activityId =
              `defiPlaza_hold_${xrdDerivativeTokenName}-${nonXrdDerivativeTokenName}` as ActivityId;

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

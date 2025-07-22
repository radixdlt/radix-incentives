import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";

import { Assets, DappConstants, getTokenPair } from "data";
import type { AccountBalanceData, ActivityId, Token } from "data";
import {
  AddressValidationService,
  type UnknownTokenError,
  CONSTANT_PRODUCT_MULTIPLIER,
} from "../../common/address-validation/addressValidation";

import type { ShapeLiquidityAsset } from "../../common/dapps/caviarnine/getShapeLiquidityAssets";
import type { CaviarnineSimplePoolLiquidityAsset } from "../../common/dapps/caviarnine/getCaviarnineResourcePoolPositions";

const CaviarNineConstants = DappConstants.CaviarNine.constants;

export type AggregateCaviarninePositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateCaviarninePositionsOutput = AccountBalanceData;

export class AggregateCaviarninePositionsService extends Context.Tag(
  "AggregateCaviarninePositionsService"
)<
  AggregateCaviarninePositionsService,
  (
    input: AggregateCaviarninePositionsInput
  ) => Effect.Effect<
    AggregateCaviarninePositionsOutput[],
    GetUsdValueServiceError | UnknownTokenError
  >
>() {}

export const AggregateCaviarninePositionsLive = Layer.effect(
  AggregateCaviarninePositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    const addressValidationService = yield* AddressValidationService;
    return (input) =>
      Effect.gen(function* () {
        const results: AccountBalanceData[] = [];
        const processedPools = new Set<string>();

        // Aggregate pools by token pair
        const poolsByTokenPair = new Map<
          string,
          {
            pools: {
              poolKey: string;
              poolAssets: (
                | ShapeLiquidityAsset
                | CaviarnineSimplePoolLiquidityAsset
              )[];
            }[];
            xTokenInfo: { name: string; isNativeAsset: boolean };
            yTokenInfo: { name: string; isNativeAsset: boolean };
          }
        >();

        // First pass: group pools by token pair
        for (const [poolKey, poolAssets] of Object.entries(
          input.accountBalance.caviarninePositions
        )) {
          const firstAsset = poolAssets[0];

          if (!firstAsset || poolAssets.length === 0) {
            continue;
          }

          const { xToken, yToken } = firstAsset;

          // Get token info including XRD derivative status
          const xTokenInfo =
            yield* addressValidationService.getTokenNameAndNativeAssetStatus(
              xToken.resourceAddress
            );
          const yTokenInfo =
            yield* addressValidationService.getTokenNameAndNativeAssetStatus(
              yToken.resourceAddress
            );

          const tokenPairKey = getTokenPair(
            xTokenInfo.name as Token,
            yTokenInfo.name as Token
          );

          if (!poolsByTokenPair.has(tokenPairKey)) {
            poolsByTokenPair.set(tokenPairKey, {
              pools: [],
              xTokenInfo,
              yTokenInfo,
            });
          }

          poolsByTokenPair
            .get(tokenPairKey)!
            .pools.push({ poolKey, poolAssets });
        }

        // Second pass: process each token pair
        for (const [
          _tokenPairKey,
          { pools, xTokenInfo, yTokenInfo },
        ] of poolsByTokenPair) {
          const isXTokenNativeAsset = xTokenInfo.isNativeAsset;
          const isYTokenNativeAsset = yTokenInfo.isNativeAsset;
          const xTokenName = xTokenInfo.name;
          const yTokenName = yTokenInfo.name;

          // Aggregate totals across all pools for this token pair
          let totalXToken = new BigNumber(0);
          let totalYToken = new BigNumber(0);
          let totalXTokenOutsidePriceBounds = new BigNumber(0);
          let totalYTokenOutsidePriceBounds = new BigNumber(0);

          const poolShares: Record<string, number> = {};
          let totalUsdValue = new BigNumber(0);

          // Pre-calculate all pool data in single pass to avoid redundant calculations
          const poolData = [];
          for (const { poolKey, poolAssets } of pools) {
            const poolTotals = poolAssets.reduce(
              (acc, item) => {
                acc.totalXToken = acc.totalXToken.plus(
                  item.xToken.withinPriceBounds
                );
                acc.totalXTokenOutsidePriceBounds =
                  acc.totalXTokenOutsidePriceBounds.plus(
                    item.xToken.outsidePriceBounds
                  );
                acc.totalYToken = acc.totalYToken.plus(
                  item.yToken.withinPriceBounds
                );
                acc.totalYTokenOutsidePriceBounds =
                  acc.totalYTokenOutsidePriceBounds.plus(
                    item.yToken.outsidePriceBounds
                  );
                return acc;
              },
              {
                totalXToken: new BigNumber(0),
                totalYToken: new BigNumber(0),
                totalXTokenOutsidePriceBounds: new BigNumber(0),
                totalYTokenOutsidePriceBounds: new BigNumber(0),
              }
            );

            // Calculate USD values for this pool
            const xTokenUsdValue = poolTotals.totalXToken.gt(0)
              ? yield* getUsdValueService({
                  amount: poolTotals.totalXToken,
                  resourceAddress: poolAssets[0]!.xToken.resourceAddress,
                  timestamp: input.timestamp,
                })
              : new BigNumber(0);

            const yTokenUsdValue = poolTotals.totalYToken.gt(0)
              ? yield* getUsdValueService({
                  amount: poolTotals.totalYToken,
                  resourceAddress: poolAssets[0]!.yToken.resourceAddress,
                  timestamp: input.timestamp,
                })
              : new BigNumber(0);

            // Check if this specific pool is constant product and apply multiplier
            const isPoolConstantProduct =
              addressValidationService.isConstantProductPool(poolKey);
            const poolMultiplier = isPoolConstantProduct
              ? CONSTANT_PRODUCT_MULTIPLIER
              : 1;

            const poolUsdValue = xTokenUsdValue
              .plus(yTokenUsdValue)
              .multipliedBy(poolMultiplier);
            totalUsdValue = totalUsdValue.plus(poolUsdValue);

            // Store all calculated values for later use
            poolData.push({
              poolKey,
              poolAssets,
              poolTotals,
              xTokenUsdValue,
              yTokenUsdValue,
              poolMultiplier,
              poolUsdValue,
            });

            // Add to overall totals
            totalXToken = totalXToken.plus(poolTotals.totalXToken);
            totalYToken = totalYToken.plus(poolTotals.totalYToken);
            totalXTokenOutsidePriceBounds = totalXTokenOutsidePriceBounds.plus(
              poolTotals.totalXTokenOutsidePriceBounds
            );
            totalYTokenOutsidePriceBounds = totalYTokenOutsidePriceBounds.plus(
              poolTotals.totalYTokenOutsidePriceBounds
            );
          }

          // Calculate pool shares using pre-calculated values
          for (const { poolKey, poolUsdValue } of poolData) {
            if (totalUsdValue.gt(0)) {
              poolShares[poolKey] = poolUsdValue
                .dividedBy(totalUsdValue)
                .toNumber();
            }
          }

          // Calculate individual token USD values for proper split
          const xTokenUsdValue = totalXToken.gt(0)
            ? yield* getUsdValueService({
                amount: totalXToken,
                resourceAddress:
                  pools[0]!.poolAssets[0]!.xToken.resourceAddress,
                timestamp: input.timestamp,
              })
            : new BigNumber(0);

          const yTokenUsdValue = totalYToken.gt(0)
            ? yield* getUsdValueService({
                amount: totalYToken,
                resourceAddress:
                  pools[0]!.poolAssets[0]!.yToken.resourceAddress,
                timestamp: input.timestamp,
              })
            : new BigNumber(0);

          // Generate activity IDs based on token pair
          const nonNativeActivityId = `c9_lp_${getTokenPair(
            xTokenName as Token,
            yTokenName as Token
          )}` as ActivityId;

          const nativeActivityId = `c9_nativeLp_${getTokenPair(
            xTokenName as Token,
            yTokenName as Token
          )}` as ActivityId;

          processedPools.add(nonNativeActivityId);
          processedPools.add(nativeActivityId);

          // Create separate metadata for each pool using pre-calculated data
          const poolMetadata: Record<string, any> = {};
          for (const { poolKey, poolAssets, poolTotals } of poolData) {
            poolMetadata[poolKey] = {
              componentAddress: poolKey,
              tokenPair: getTokenPair(xTokenName as Token, yTokenName as Token),
              baseToken: {
                resourceAddress: poolAssets[0]!.xToken.resourceAddress,
                amount: poolTotals.totalXToken.toString(),
                outsidePriceBounds:
                  poolTotals.totalXTokenOutsidePriceBounds.toString(),
                isNativeAsset: isXTokenNativeAsset,
              },
              quoteToken: {
                resourceAddress: poolAssets[0]!.yToken.resourceAddress,
                amount: poolTotals.totalYToken.toString(),
                outsidePriceBounds:
                  poolTotals.totalYTokenOutsidePriceBounds.toString(),
                isNativeAsset: isYTokenNativeAsset,
              },
            };
          }

          // Calculate wrapped and native asset portions from the totalUsdValue
          const wrappedAssetPortion = new BigNumber(0)
            .plus(isXTokenNativeAsset ? 0 : xTokenUsdValue)
            .plus(isYTokenNativeAsset ? 0 : yTokenUsdValue);

          const nativeAssetPortion = new BigNumber(0)
            .plus(isXTokenNativeAsset ? xTokenUsdValue : 0)
            .plus(isYTokenNativeAsset ? yTokenUsdValue : 0);

          const totalPortion = wrappedAssetPortion.plus(nativeAssetPortion);

          // Calculate final USD values using the already-multiplied totalUsdValue
          const finalWrappedAssetUsdValue = totalPortion.gt(0)
            ? totalUsdValue
                .multipliedBy(wrappedAssetPortion)
                .dividedBy(totalPortion)
            : new BigNumber(0);

          const finalNativeAssetUsdValue = totalPortion.gt(0)
            ? totalUsdValue
                .multipliedBy(nativeAssetPortion)
                .dividedBy(totalPortion)
            : new BigNumber(0);

          // Add non-native LP activity (non-XRD derivative tokens only)
          results.push({
            activityId: nonNativeActivityId,
            usdValue: finalWrappedAssetUsdValue.toString(),
            poolShare:
              Object.keys(poolShares).length > 1 ? poolShares : undefined,
            metadata: poolMetadata,
          });

          // Add native LP activity (XRD derivatives only)
          results.push({
            activityId: nativeActivityId,
            usdValue: finalNativeAssetUsdValue.toString(),
            poolShare:
              Object.keys(poolShares).length > 1 ? poolShares : undefined,
            metadata: poolMetadata,
          });
        }

        // Process Hyperstake positions (simple pool - LSULP/XRD)
        let totalLsulpAmount = new BigNumber(0);
        let totalXrdAmount = new BigNumber(0);

        for (const hyperstakeItem of input.accountBalance.hyperstakePositions
          .items) {
          for (const position of hyperstakeItem.position) {
            if (
              position.resourceAddress ===
              CaviarNineConstants.LSULP.resourceAddress
            ) {
              totalLsulpAmount = totalLsulpAmount.plus(position.amount);
            } else if (position.resourceAddress === Assets.Fungible.XRD) {
              totalXrdAmount = totalXrdAmount.plus(position.amount);
            }
          }
        }

        // Calculate USD value for hyperstake (LSULP/XRD pool)
        let hyperstakeUsdValue = new BigNumber(0);
        if (totalLsulpAmount.gt(0)) {
          const lsulpUsdValue = yield* getUsdValueService({
            amount: totalLsulpAmount,
            resourceAddress: CaviarNineConstants.LSULP.resourceAddress,
            timestamp: input.timestamp,
          });
          hyperstakeUsdValue = hyperstakeUsdValue.plus(lsulpUsdValue);
        }
        if (totalXrdAmount.gt(0)) {
          const xrdUsdValue = yield* getUsdValueService({
            amount: totalXrdAmount,
            resourceAddress: Assets.Fungible.XRD,
            timestamp: input.timestamp,
          });
          hyperstakeUsdValue = hyperstakeUsdValue.plus(xrdUsdValue);
        }

        // Hyperstake is LSULP/XRD pool, both are XRD derivatives
        // Change from "c9_lp_hyperstake" to "c9_nativeLp_hyperstake"
        const hyperstakeActivityId = "c9_nativeLp_hyperstake" as ActivityId;
        processedPools.add(hyperstakeActivityId);

        results.push({
          activityId: hyperstakeActivityId,
          usdValue: hyperstakeUsdValue.toString(), // Now tracking XRD derivative USD value
          metadata: {
            tokenPair: "lsulp_xrd",
            baseToken: {
              resourceAddress: CaviarNineConstants.LSULP.resourceAddress,
              amount: totalLsulpAmount.toString(),
              isNativeAsset: true,
            },
            quoteToken: {
              resourceAddress: Assets.Fungible.XRD,
              amount: totalXrdAmount.toString(),
              isNativeAsset: true,
            },
          },
        });

        const allCaviarPools = [
          ...Object.values(CaviarNineConstants.shapeLiquidityPools),
          ...Object.values(CaviarNineConstants.simplePools),
        ];

        // add zero entries
        for (const pool of allCaviarPools) {
          const xTokenInfo =
            yield* addressValidationService.getTokenNameAndNativeAssetStatus(
              pool.token_x
            );
          const yTokenInfo =
            yield* addressValidationService.getTokenNameAndNativeAssetStatus(
              pool.token_y
            );
          const nonNativeActivityId = `c9_lp_${getTokenPair(
            xTokenInfo.name as Token,
            yTokenInfo.name as Token
          )}` as ActivityId;
          const nativeActivityId = `c9_nativeLp_${getTokenPair(
            xTokenInfo.name as Token,
            yTokenInfo.name as Token
          )}` as ActivityId;

          // Get XRD derivative status from the centralized function
          const isXTokenNativeAsset = xTokenInfo.isNativeAsset;
          const isYTokenNativeAsset = yTokenInfo.isNativeAsset;

          // Add zero entry for non-native LP if not processed
          if (!processedPools.has(nonNativeActivityId)) {
            results.push({
              activityId: nonNativeActivityId,
              usdValue: "0",
              metadata: {
                tokenPair: getTokenPair(
                  xTokenInfo.name as Token,
                  yTokenInfo.name as Token
                ),
                baseToken: {
                  resourceAddress: pool.token_x,
                  amount: "0",
                  isNativeAsset: isXTokenNativeAsset,
                },
                quoteToken: {
                  resourceAddress: pool.token_y,
                  amount: "0",
                  isNativeAsset: isYTokenNativeAsset,
                },
              },
            });
          }

          // Add zero entry for native LP if not processed
          if (!processedPools.has(nativeActivityId)) {
            results.push({
              activityId: nativeActivityId,
              usdValue: "0",
              metadata: {
                tokenPair: getTokenPair(
                  xTokenInfo.name as Token,
                  yTokenInfo.name as Token
                ),
                baseToken: {
                  resourceAddress: pool.token_x,
                  amount: "0",
                  isNativeAsset: isXTokenNativeAsset,
                },
                quoteToken: {
                  resourceAddress: pool.token_y,
                  amount: "0",
                  isNativeAsset: isYTokenNativeAsset,
                },
              },
            });
          }
        }

        // Add zero entry for Hyperstake if not processed (now using nativeLp naming)
        const hyperstakeActivityIdCheck =
          "c9_nativeLp_hyperstake" as ActivityId;
        if (!processedPools.has(hyperstakeActivityIdCheck)) {
          results.push({
            activityId: hyperstakeActivityIdCheck,
            usdValue: "0",
            metadata: {
              tokenPair: "lsulp_xrd",
              baseToken: {
                resourceAddress: CaviarNineConstants.LSULP.resourceAddress,
                amount: "0",
                isNativeAsset: true,
              },
              quoteToken: {
                resourceAddress: Assets.Fungible.XRD,
                amount: "0",
                isNativeAsset: true,
              },
            },
          });
        }

        return results;
      });
  })
);

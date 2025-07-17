import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import { CaviarNineConstants } from "../../common/dapps/caviarnine/constants";
import type { AccountBalanceData, ActivityId, Token } from "db/incentives";
import {
  AddressValidationService,
  type UnknownTokenError,
} from "../../common/address-validation/addressValidation";
import { getPair } from "../../common/helpers/getPair";

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

        // Process each pool in the CaviarNine positions
        for (const [_poolKey, poolAssets] of Object.entries(
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

          const isXTokenNativeAsset = xTokenInfo.isNativeAsset;
          const isYTokenNativeAsset = yTokenInfo.isNativeAsset;
          const xTokenName = xTokenInfo.name;
          const yTokenName = yTokenInfo.name;

          const totals = poolAssets.reduce(
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

          // Calculate USD values for both tokens upfront (only if amounts > 0)
          const xTokenUsdValue = totals.totalXToken.gt(0)
            ? yield* getUsdValueService({
                amount: totals.totalXToken,
                resourceAddress: xToken.resourceAddress,
                timestamp: input.timestamp,
              })
            : new BigNumber(0);

          const yTokenUsdValue = totals.totalYToken.gt(0)
            ? yield* getUsdValueService({
                amount: totals.totalYToken,
                resourceAddress: yToken.resourceAddress,
                timestamp: input.timestamp,
              })
            : new BigNumber(0);

          // Split values based on XRD derivative status
          const totalWrappedAssetUsdValue = new BigNumber(0)
            .plus(isXTokenNativeAsset ? 0 : xTokenUsdValue)
            .plus(isYTokenNativeAsset ? 0 : yTokenUsdValue);

          const totalNativeAssetUsdValue = new BigNumber(0)
            .plus(isXTokenNativeAsset ? xTokenUsdValue : 0)
            .plus(isYTokenNativeAsset ? yTokenUsdValue : 0);

          // Generate activity IDs based on token pair
          const nonNativeActivityId = `c9_lp_${getPair(
            xTokenName as Token,
            yTokenName as Token
          )}` as ActivityId;

          const nativeActivityId = `c9_nativeLp_${getPair(
            xTokenName as Token,
            yTokenName as Token
          )}` as ActivityId;

          processedPools.add(nonNativeActivityId);
          processedPools.add(nativeActivityId);

          // Add non-native LP activity (non-XRD derivative tokens only)
          results.push({
            activityId: nonNativeActivityId,
            usdValue: totalWrappedAssetUsdValue.toString(),
            metadata: {
              tokenPair: getPair(xTokenName as Token, yTokenName as Token),
              baseToken: {
                resourceAddress: xToken.resourceAddress,
                amount: totals.totalXToken.toString(),
                outsidePriceBounds:
                  totals.totalXTokenOutsidePriceBounds.toString(),
                isNativeAsset: isXTokenNativeAsset,
              },
              quoteToken: {
                resourceAddress: yToken.resourceAddress,
                amount: totals.totalYToken.toString(),
                outsidePriceBounds:
                  totals.totalYTokenOutsidePriceBounds.toString(),
                isNativeAsset: isYTokenNativeAsset,
              },
            },
          });

          // Add native LP activity (XRD derivatives only)
          results.push({
            activityId: nativeActivityId,
            usdValue: totalNativeAssetUsdValue.toString(),
            metadata: {
              tokenPair: getPair(xTokenName as Token, yTokenName as Token),
              baseToken: {
                resourceAddress: xToken.resourceAddress,
                amount: totals.totalXToken.toString(),
                outsidePriceBounds:
                  totals.totalXTokenOutsidePriceBounds.toString(),
                isNativeAsset: isXTokenNativeAsset,
              },
              quoteToken: {
                resourceAddress: yToken.resourceAddress,
                amount: totals.totalYToken.toString(),
                outsidePriceBounds:
                  totals.totalYTokenOutsidePriceBounds.toString(),
                isNativeAsset: isYTokenNativeAsset,
              },
            },
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

        // Add zero entries for shape liquidity pools with no positions
        for (const pool of Object.values(
          CaviarNineConstants.shapeLiquidityPools
        )) {
          const xTokenInfo =
            yield* addressValidationService.getTokenNameAndNativeAssetStatus(
              pool.token_x
            );
          const yTokenInfo =
            yield* addressValidationService.getTokenNameAndNativeAssetStatus(
              pool.token_y
            );
          const nonNativeActivityId = `c9_lp_${getPair(
            xTokenInfo.name as Token,
            yTokenInfo.name as Token
          )}` as ActivityId;
          const nativeActivityId = `c9_nativeLp_${getPair(
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
                tokenPair: getPair(
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
                tokenPair: getPair(
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

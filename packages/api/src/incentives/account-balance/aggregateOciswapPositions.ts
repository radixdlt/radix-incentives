import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { OciswapConstants } from "../../common/dapps/ociswap/constants";
import type { AccountBalanceData, ActivityId, Token } from "db/incentives";
import {
  AddressValidationService,
  type UnknownTokenError,
} from "../../common/address-validation/addressValidation";
import { getPair } from "../../common/helpers/getPair";

// Only include metadata if STORE_METADATA is not set to 'false' (defaults to true then)
const STORE_METADATA = process.env.STORE_METADATA !== "false";

export type AggregateOciswapPositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateOciswapPositionsOutput = AccountBalanceData;

export class AggregateOciswapPositionsService extends Context.Tag(
  "AggregateOciswapPositionsService"
)<
  AggregateOciswapPositionsService,
  (
    input: AggregateOciswapPositionsInput
  ) => Effect.Effect<
    AggregateOciswapPositionsOutput[],
    GetUsdValueServiceError | UnknownTokenError
  >
>() {}

export const AggregateOciswapPositionsLive = Layer.effect(
  AggregateOciswapPositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    const addressValidationService = yield* AddressValidationService;
    return (input) =>
      Effect.gen(function* () {
        const results: AccountBalanceData[] = [];
        const processedPools = new Set<string>();

        // Process each pool in the OciSwap positions
        for (const [_poolKey, poolAssets] of Object.entries(
          input.accountBalance.ociswapPositions
        )) {
          const firstAsset = poolAssets[0];

          if (!firstAsset || poolAssets.length === 0) {
            continue;
          }

          const { xToken, yToken } = firstAsset;

          // Get token info including XRD derivative status
          const xTokenInfo =
            yield* addressValidationService.getTokenNameAndXrdStatus(
              xToken.resourceAddress
            );
          const yTokenInfo =
            yield* addressValidationService.getTokenNameAndXrdStatus(
              yToken.resourceAddress
            );

          const isXTokenXrdDerivative = xTokenInfo.isXrdDerivative;
          const isYTokenXrdDerivative = yTokenInfo.isXrdDerivative;
          const xTokenName = xTokenInfo.name;
          const yTokenName = yTokenInfo.name;

          const totals = poolAssets.reduce(
            (acc, item) => {
              // Use amountInBounds for LP tracking (within price bounds)
              acc.totalXToken = acc.totalXToken.plus(
                item.xToken.amountInBounds
              );
              acc.totalXTokenOutsidePriceBounds =
                acc.totalXTokenOutsidePriceBounds.plus(
                  new BigNumber(item.xToken.totalAmount).minus(
                    item.xToken.amountInBounds
                  )
                );
              acc.totalYToken = acc.totalYToken.plus(
                item.yToken.amountInBounds
              );
              acc.totalYTokenOutsidePriceBounds =
                acc.totalYTokenOutsidePriceBounds.plus(
                  new BigNumber(item.yToken.totalAmount).minus(
                    item.yToken.amountInBounds
                  )
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
          const totalNonXrdUsdValue = new BigNumber(0)
            .plus(isXTokenXrdDerivative ? 0 : xTokenUsdValue)
            .plus(isYTokenXrdDerivative ? 0 : yTokenUsdValue);

          const totalXrdDerivativeUsdValue = new BigNumber(0)
            .plus(isXTokenXrdDerivative ? xTokenUsdValue : 0)
            .plus(isYTokenXrdDerivative ? yTokenUsdValue : 0);

          // Generate activity IDs based on token pair
          const nonNativeActivityId =
            `oci_lp_${getPair(xTokenName as Token, yTokenName as Token)}` as ActivityId;
          const nativeActivityId =
            `oci_nativeLp_${getPair(xTokenName as Token, yTokenName as Token)}` as ActivityId;

          processedPools.add(nonNativeActivityId);
          processedPools.add(nativeActivityId);

          // Add non-native LP activity (non-XRD tokens only)
          results.push(
            STORE_METADATA
              ? {
                  activityId: nonNativeActivityId,
                  usdValue: totalNonXrdUsdValue.toString(),
                  metadata: {
                    tokenPair: getPair(
                      xTokenName as Token,
                      yTokenName as Token
                    ),
                    baseToken: {
                      resourceAddress: xToken.resourceAddress,
                      amount: totals.totalXToken.toString(),
                      outsidePriceBounds:
                        totals.totalXTokenOutsidePriceBounds.toString(),
                      isXrdOrDerivative: isXTokenXrdDerivative,
                    },
                    quoteToken: {
                      resourceAddress: yToken.resourceAddress,
                      amount: totals.totalYToken.toString(),
                      outsidePriceBounds:
                        totals.totalYTokenOutsidePriceBounds.toString(),
                      isXrdOrDerivative: isYTokenXrdDerivative,
                    },
                  },
                }
              : {
                  activityId: nonNativeActivityId,
                  usdValue: totalNonXrdUsdValue.toString(),
                }
          );

          // Add native LP activity (XRD derivatives only)
          results.push(
            STORE_METADATA
              ? {
                  activityId: nativeActivityId,
                  usdValue: totalXrdDerivativeUsdValue.toString(),
                  metadata: {
                    tokenPair: getPair(
                      xTokenName as Token,
                      yTokenName as Token
                    ),
                    baseToken: {
                      resourceAddress: xToken.resourceAddress,
                      amount: totals.totalXToken.toString(),
                      outsidePriceBounds:
                        totals.totalXTokenOutsidePriceBounds.toString(),
                      isXrdOrDerivative: isXTokenXrdDerivative,
                    },
                    quoteToken: {
                      resourceAddress: yToken.resourceAddress,
                      amount: totals.totalYToken.toString(),
                      outsidePriceBounds:
                        totals.totalYTokenOutsidePriceBounds.toString(),
                      isXrdOrDerivative: isYTokenXrdDerivative,
                    },
                  },
                }
              : {
                  activityId: nativeActivityId,
                  usdValue: totalXrdDerivativeUsdValue.toString(),
                }
          );
        }

        // Add zero entries for all OciSwap pool types with no positions
        const allPools = [
          ...Object.values(OciswapConstants.pools),
          ...Object.values(OciswapConstants.poolsV2),
          ...Object.values(OciswapConstants.flexPools),
          ...Object.values(OciswapConstants.basicPools),
        ];

        for (const pool of allPools) {
          const xTokenInfo =
            yield* addressValidationService.getTokenNameAndXrdStatus(
              pool.token_x
            );
          const yTokenInfo =
            yield* addressValidationService.getTokenNameAndXrdStatus(
              pool.token_y
            );
          const nonNativeActivityId =
            `oci_lp_${getPair(xTokenInfo.name as Token, yTokenInfo.name as Token)}` as ActivityId;
          const nativeActivityId =
            `oci_nativeLp_${getPair(xTokenInfo.name as Token, yTokenInfo.name as Token)}` as ActivityId;

          // Get XRD derivative status from the centralized function
          const isXTokenXrdDerivative = xTokenInfo.isXrdDerivative;
          const isYTokenXrdDerivative = yTokenInfo.isXrdDerivative;

          // Add zero entry for non-native LP if not processed
          if (!processedPools.has(nonNativeActivityId)) {
            results.push(
              STORE_METADATA
                ? {
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
                        outsidePriceBounds: "0",
                        isXrdOrDerivative: isXTokenXrdDerivative,
                      },
                      quoteToken: {
                        resourceAddress: pool.token_y,
                        amount: "0",
                        outsidePriceBounds: "0",
                        isXrdOrDerivative: isYTokenXrdDerivative,
                      },
                    },
                  }
                : {
                    activityId: nonNativeActivityId,
                    usdValue: "0",
                  }
            );
          }

          // Add zero entry for native LP if not processed
          if (!processedPools.has(nativeActivityId)) {
            results.push(
              STORE_METADATA
                ? {
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
                        outsidePriceBounds: "0",
                        isXrdOrDerivative: isXTokenXrdDerivative,
                      },
                      quoteToken: {
                        resourceAddress: pool.token_y,
                        amount: "0",
                        outsidePriceBounds: "0",
                        isXrdOrDerivative: isYTokenXrdDerivative,
                      },
                    },
                  }
                : {
                    activityId: nativeActivityId,
                    usdValue: "0",
                  }
            );
          }
        }

        return results;
      });
  })
);

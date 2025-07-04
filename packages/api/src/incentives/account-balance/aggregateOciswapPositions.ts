import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import { OciswapConstants } from "../../common/dapps/ociswap/constants";
import type { AccountBalanceData, ActivityId } from "db/incentives";
import {
  AddressValidationService,
  type UnknownTokenError,
} from "../../common/address-validation/addressValidation";

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

          // Determine which tokens are XRD derivatives (only XRD for OciSwap)
          const isXTokenXrdDerivative =
            xToken.resourceAddress === Assets.Fungible.XRD;
          const isYTokenXrdDerivative =
            yToken.resourceAddress === Assets.Fungible.XRD;

          // Get token names for the pair
          const xTokenName = yield* addressValidationService.getTokenName(
            xToken.resourceAddress
          );
          const yTokenName = yield* addressValidationService.getTokenName(
            yToken.resourceAddress
          );

          const totals = poolAssets.reduce(
            (acc, item) => {
              // Use amountInBounds for LP tracking (within price bounds)
              acc.totalXToken = acc.totalXToken.plus(
                item.xToken.amountInBounds
              );
              acc.totalYToken = acc.totalYToken.plus(
                item.yToken.amountInBounds
              );
              return acc;
            },
            { totalXToken: new BigNumber(0), totalYToken: new BigNumber(0) }
          );

          // Calculate USD value of all non-XRD tokens
          let totalNonXrdUsdValue = new BigNumber(0);

          // Add xToken value if it's not XRD
          if (!isXTokenXrdDerivative && totals.totalXToken.gt(0)) {
            const xTokenUsdValue = yield* getUsdValueService({
              amount: totals.totalXToken,
              resourceAddress: xToken.resourceAddress,
              timestamp: input.timestamp,
            });
            totalNonXrdUsdValue = totalNonXrdUsdValue.plus(xTokenUsdValue);
          }

          // Add yToken value if it's not XRD
          if (!isYTokenXrdDerivative && totals.totalYToken.gt(0)) {
            const yTokenUsdValue = yield* getUsdValueService({
              amount: totals.totalYToken,
              resourceAddress: yToken.resourceAddress,
              timestamp: input.timestamp,
            });
            totalNonXrdUsdValue = totalNonXrdUsdValue.plus(yTokenUsdValue);
          }

          // Generate activity ID based on token pair - sort alphabetically
          const [tokenA, tokenB] = [xTokenName, yTokenName].sort();
          const activityId = `oci_lp_${tokenA}-${tokenB}` as ActivityId;
          processedPools.add(activityId);

          results.push(
            STORE_METADATA
              ? {
                  activityId,
                  usdValue: totalNonXrdUsdValue.toString(),
                  metadata: {
                    tokenPair: `${xTokenName}_${yTokenName}`,
                    baseToken: {
                      resourceAddress: xToken.resourceAddress,
                      amount: totals.totalXToken.toString(),
                      isXrdOrDerivative: isXTokenXrdDerivative,
                    },
                    quoteToken: {
                      resourceAddress: yToken.resourceAddress,
                      amount: totals.totalYToken.toString(),
                      isXrdOrDerivative: isYTokenXrdDerivative,
                    },
                  },
                }
              : {
                  activityId,
                  usdValue: totalNonXrdUsdValue.toString(),
                }
          );
        }

        // Add zero entries for OciSwap pools with no positions
        for (const pool of Object.values(OciswapConstants.pools)) {
          const xTokenName = yield* addressValidationService.getTokenName(
            pool.token_x
          );
          const yTokenName = yield* addressValidationService.getTokenName(
            pool.token_y
          );
          const [tokenA, tokenB] = [xTokenName, yTokenName].sort();
          const activityId = `oci_lp_${tokenA}-${tokenB}` as ActivityId;

          if (!processedPools.has(activityId)) {
            // Determine which tokens are XRD derivatives
            const isXTokenXrdDerivative = pool.token_x === Assets.Fungible.XRD;
            const isYTokenXrdDerivative = pool.token_y === Assets.Fungible.XRD;

            results.push(
              STORE_METADATA
                ? {
                    activityId,
                    usdValue: "0",
                    metadata: {
                      tokenPair: `${xTokenName}_${yTokenName}`,
                      baseToken: {
                        resourceAddress: pool.token_x,
                        amount: "0",
                        isXrdOrDerivative: isXTokenXrdDerivative,
                      },
                      quoteToken: {
                        resourceAddress: pool.token_y,
                        amount: "0",
                        isXrdOrDerivative: isYTokenXrdDerivative,
                      },
                    },
                  }
                : {
                    activityId,
                    usdValue: "0",
                  }
            );
          }
        }

        return results;
      });
  })
);

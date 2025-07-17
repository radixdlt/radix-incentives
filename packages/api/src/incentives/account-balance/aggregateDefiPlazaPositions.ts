import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { DefiPlaza } from "../../common/dapps/defiplaza/constants";
import type { AccountBalanceData, ActivityId, Token } from "db/incentives";
import {
  AddressValidationService,
  type UnknownTokenError,
  CONSTANT_PRODUCT_MULTIPLIER,
} from "../../common/address-validation/addressValidation";
import { getPair } from "../../common/helpers/getPair";

export class InvalidDefiPlazaPositionError {
  readonly _tag = "InvalidDefiPlazaPositionError";
  constructor(
    readonly lpResourceAddress: string,
    readonly reason: string
  ) {}
}

export type AggregateDefiPlazaPositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateDefiPlazaPositionsOutput = AccountBalanceData;

export class AggregateDefiPlazaPositionsService extends Context.Tag(
  "AggregateDefiPlazaPositionsService"
)<
  AggregateDefiPlazaPositionsService,
  (
    input: AggregateDefiPlazaPositionsInput
  ) => Effect.Effect<
    AggregateDefiPlazaPositionsOutput[],
    GetUsdValueServiceError | UnknownTokenError | InvalidDefiPlazaPositionError
  >
>() {}

export const AggregateDefiPlazaPositionsLive = Layer.effect(
  AggregateDefiPlazaPositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    const addressValidationService = yield* AddressValidationService;
    return (input) =>
      Effect.gen(function* () {
        const defiPlazaPositions =
          input.accountBalance.defiPlazaPositions.items;

        if (defiPlazaPositions.length === 0) {
          // Return zero entries for all supported pools (both native and non-native)
          const results: AggregateDefiPlazaPositionsOutput[] = [];
          for (const pool of Object.values(DefiPlaza)) {
            const baseTokenInfo =
              yield* addressValidationService.getTokenNameAndNativeAssetStatus(
                pool.baseResourceAddress
              );
            const quoteTokenInfo =
              yield* addressValidationService.getTokenNameAndNativeAssetStatus(
                pool.quoteResourceAddress
              );

            // Add non-native LP zero entry
            results.push({
              activityId: `defiPlaza_lp_${getPair(
                baseTokenInfo.name as Token,
                quoteTokenInfo.name as Token
              )}` as ActivityId,
              usdValue: new BigNumber(0).toString(),
            });

            // Add native LP zero entry
            results.push({
              activityId: `defiPlaza_nativeLp_${getPair(
                baseTokenInfo.name as Token,
                quoteTokenInfo.name as Token
              )}` as ActivityId,
              usdValue: new BigNumber(0).toString(),
            });
          }
          return results;
        }

        const results: AggregateDefiPlazaPositionsOutput[] = [];
        const processedActivityIds = new Set<string>();

        for (const lpPosition of defiPlazaPositions) {
          // DefiPlaza pools should have exactly 2 tokens
          if (lpPosition.position.length !== 2) {
            return yield* Effect.fail(
              new InvalidDefiPlazaPositionError(
                lpPosition.lpResourceAddress,
                `DefiPlaza position must contain exactly 2 tokens. Found: ${lpPosition.position.length}`
              )
            );
          }

          const [position1, position2] = lpPosition.position;
          if (!position1 || !position2) {
            return yield* Effect.fail(
              new InvalidDefiPlazaPositionError(
                lpPosition.lpResourceAddress,
                "Invalid position structure"
              )
            );
          }

          // Get token info including XRD derivative status
          const token1Info =
            yield* addressValidationService.getTokenNameAndNativeAssetStatus(
              position1.resourceAddress
            );
          const token2Info =
            yield* addressValidationService.getTokenNameAndNativeAssetStatus(
              position2.resourceAddress
            );

          const token1Name = token1Info.name;
          const token2Name = token2Info.name;
          const isToken1NativeAsset = token1Info.isNativeAsset;
          const isToken2NativeAsset = token2Info.isNativeAsset;

          // Calculate USD values for both tokens upfront
          const token1UsdValue = yield* getUsdValueService({
            amount: new BigNumber(position1.amount),
            resourceAddress: position1.resourceAddress,
            timestamp: input.timestamp,
          });

          const token2UsdValue = yield* getUsdValueService({
            amount: new BigNumber(position2.amount),
            resourceAddress: position2.resourceAddress,
            timestamp: input.timestamp,
          });

          // Split values based on XRD derivative status
          // Apply constant product multiplier for DefiPlaza pools
          const totalWrappedAssetUsdValue = new BigNumber(0)
            .plus(isToken1NativeAsset ? 0 : token1UsdValue)
            .plus(isToken2NativeAsset ? 0 : token2UsdValue)
            .multipliedBy(CONSTANT_PRODUCT_MULTIPLIER);

          const totalNativeAssetUsdValue = new BigNumber(0)
            .plus(isToken1NativeAsset ? token1UsdValue : 0)
            .plus(isToken2NativeAsset ? token2UsdValue : 0)
            .multipliedBy(CONSTANT_PRODUCT_MULTIPLIER);

          // Generate dynamic activity IDs based on token pair (alphabetical order for consistency)
          const nonNativeActivityId = `defiPlaza_lp_${getPair(
            token1Name as Token,
            token2Name as Token
          )}` as ActivityId;

          const nativeActivityId = `defiPlaza_nativeLp_${getPair(
            token1Name as Token,
            token2Name as Token
          )}` as ActivityId;

          // Check for duplicate activity IDs and handle aggregation for non-native
          if (processedActivityIds.has(nonNativeActivityId)) {
            // Find existing result and add to it
            const existingResultIndex = results.findIndex(
              (r) => r.activityId === nonNativeActivityId
            );
            if (existingResultIndex >= 0) {
              const existingResult = results[existingResultIndex];
              if (existingResult) {
                const newTotalValue = new BigNumber(
                  existingResult.usdValue
                ).plus(totalWrappedAssetUsdValue);
                results[existingResultIndex] = {
                  ...existingResult,
                  usdValue: newTotalValue.toString(),
                  metadata: {
                    ...existingResult.metadata,
                    note: "Aggregated from multiple positions",
                  },
                };
              }
            }
          } else {
            processedActivityIds.add(nonNativeActivityId);
            // Find the pool configuration for this lpResourceAddress
            const poolConfig = Object.values(DefiPlaza).find(
              (pool) => pool.baseLpResourceAddress === lpPosition.lpResourceAddress
            );
            
            results.push({
              activityId: nonNativeActivityId,
              usdValue: totalWrappedAssetUsdValue.toString(),
              metadata: {
                componentAddress: poolConfig?.componentAddress ?? lpPosition.lpResourceAddress,
                tokenPair: getPair(token1Name as Token, token2Name as Token),
                baseToken: {
                  resourceAddress: position1.resourceAddress,
                  amount: position1.amount.toString(),
                  isNativeAsset: isToken1NativeAsset,
                },
                quoteToken: {
                  resourceAddress: position2.resourceAddress,
                  amount: position2.amount.toString(),
                  isNativeAsset: isToken2NativeAsset,
                },
              },
            });
          }

          // Check for duplicate activity IDs and handle aggregation for native
          if (processedActivityIds.has(nativeActivityId)) {
            // Find existing result and add to it
            const existingResultIndex = results.findIndex(
              (r) => r.activityId === nativeActivityId
            );
            if (existingResultIndex >= 0) {
              const existingResult = results[existingResultIndex];
              if (existingResult) {
                const newTotalValue = new BigNumber(
                  existingResult.usdValue
                ).plus(totalNativeAssetUsdValue);
                results[existingResultIndex] = {
                  ...existingResult,
                  usdValue: newTotalValue.toString(),
                  metadata: {
                    ...existingResult.metadata,
                    note: "Aggregated from multiple positions",
                  },
                };
              }
            }
          } else {
            processedActivityIds.add(nativeActivityId);
            // Find the pool configuration for this lpResourceAddress
            const poolConfig = Object.values(DefiPlaza).find(
              (pool) => pool.baseLpResourceAddress === lpPosition.lpResourceAddress
            );
            
            results.push({
              activityId: nativeActivityId,
              usdValue: totalNativeAssetUsdValue.toString(),
              metadata: {
                componentAddress: poolConfig?.componentAddress ?? lpPosition.lpResourceAddress,
                tokenPair: getPair(token1Name as Token, token2Name as Token),
                baseToken: {
                  resourceAddress: position1.resourceAddress,
                  amount: position1.amount.toString(),
                  isNativeAsset: isToken1NativeAsset,
                },
                quoteToken: {
                  resourceAddress: position2.resourceAddress,
                  amount: position2.amount.toString(),
                  isNativeAsset: isToken2NativeAsset,
                },
              },
            });
          }
        }

        return results;
      });
  })
);

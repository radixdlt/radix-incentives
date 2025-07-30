import { Config, Data, Effect } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { GetUsdValueService } from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import {
  DappConstants,
  type ActivityId,
  type AccountBalanceData,
  getTokenPair,
} from "data";

import {
  AddressValidationService,
  CONSTANT_PRODUCT_MULTIPLIER,
} from "../../common/address-validation/addressValidation";
import { determineLpActivityId } from "./determineLpActivityId";

const DefiPlazaConstants = DappConstants.DefiPlaza.constants;

export class InvalidDefiPlazaPositionError extends Data.TaggedClass(
  "InvalidDefiPlazaPositionError"
)<{ lpResourceAddress: string; reason: string }> {}

export type AggregateDefiPlazaPositionsOutput = Effect.Effect.Success<
  ReturnType<typeof AggregateDefiPlazaPositionsService.Service>
>;

type DefiPlazaPositions = AccountBalanceFromSnapshot["defiPlazaPositions"];

type Metadata = {
  componentAddress: string;
  tokenPair: string;
  baseToken: {
    resourceAddress: string;
    amount: string;
    isNativeAsset: boolean;
  };
  quoteToken: {
    resourceAddress: string;
    amount: string;
    isNativeAsset: boolean;
  };
  note?: string;
};

export class AggregateDefiPlazaPositionsService extends Effect.Service<AggregateDefiPlazaPositionsService>()(
  "AggregateDefiPlazaPositionsService",
  {
    effect: Effect.gen(function* () {
      const STORE_METADATA = Config.boolean("storeMetadata").pipe(
        Config.withDefault(true)
      );
      const getUsdValueService = yield* GetUsdValueService;
      const addressValidationService = yield* AddressValidationService;

      const createDefaultValues = Effect.fn(function* () {
        return yield* Effect.forEach(
          Object.values(DefiPlazaConstants),
          Effect.fn(function* (pool) {
            const baseTokenInfo =
              yield* addressValidationService.getTokenNameAndNativeAssetStatus(
                pool.baseResourceAddress
              );
            const quoteTokenInfo =
              yield* addressValidationService.getTokenNameAndNativeAssetStatus(
                pool.quoteResourceAddress
              );

            const tokenPair = getTokenPair(
              baseTokenInfo.name,
              quoteTokenInfo.name
            );

            const { activityId, isNativeLp } = yield* determineLpActivityId(
              "defiPlaza",
              tokenPair
            );

            const defaultMetadata = STORE_METADATA
              ? {
                  componentAddress: pool.componentAddress,
                  tokenPair,
                  baseToken: {
                    resourceAddress: pool.baseResourceAddress,
                    amount: "0",
                    isNativeAsset: baseTokenInfo.isNativeAsset,
                  },
                  quoteToken: {
                    resourceAddress: pool.quoteResourceAddress,
                    amount: "0",
                    isNativeAsset: quoteTokenInfo.isNativeAsset,
                  },
                }
              : undefined;

            return [
              {
                activityId,
                isNativeLp,
                usdValue: "0",
                metadata: defaultMetadata,
              },
            ];
          }),
          { concurrency: "unbounded" }
        ).pipe(
          Effect.map((results) =>
            results.flat().reduce((acc, curr) => {
              acc.set(curr.activityId, {
                activityId: curr.activityId,
                usdValue: curr.usdValue,
                metadata: curr.metadata,
              });
              return acc;
            }, new Map<ActivityId, AccountBalanceData>())
          )
        );
      });

      const processDefiPlazaPositions = Effect.fn(function* (input: {
        positions: DefiPlazaPositions["items"];
        timestamp: Date;
      }) {
        const { positions, timestamp } = input;
        // const aggregatedData = new Map<ActivityId, AccountBalanceData>();

        const result = yield* Effect.forEach(
          positions,
          Effect.fn(function* (lpPosition) {
            const output: {
              activityId: ActivityId;
              usdValue: BigNumber;
              metadata?: Metadata;
            }[] = [];
            // DefiPlaza pools should have exactly 2 tokens
            if (lpPosition.position.length !== 2) {
              return yield* Effect.fail(
                new InvalidDefiPlazaPositionError({
                  lpResourceAddress: lpPosition.lpResourceAddress,
                  reason: `DefiPlaza position must contain exactly 2 tokens. Found: ${lpPosition.position.length}`,
                })
              );
            }

            const [position1, position2] = lpPosition.position;
            if (!position1 || !position2) {
              return yield* Effect.fail(
                new InvalidDefiPlazaPositionError({
                  lpResourceAddress: lpPosition.lpResourceAddress,
                  reason: "Invalid position structure",
                })
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
              timestamp,
            });

            const token2UsdValue = yield* getUsdValueService({
              amount: new BigNumber(position2.amount),
              resourceAddress: position2.resourceAddress,
              timestamp,
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

            // Generate dynamic activity IDs based on token pair
            const tokenPair = getTokenPair(token1Name, token2Name);

            const { activityId } = yield* determineLpActivityId(
              "defiPlaza",
              tokenPair
            );

            // Find the pool configuration for this lpResourceAddress
            const poolConfig = Object.values(DefiPlazaConstants).find(
              (pool) =>
                pool.baseLpResourceAddress === lpPosition.lpResourceAddress
            );

            const componentAddress =
              poolConfig?.componentAddress ?? lpPosition.lpResourceAddress;

            // Process non-native LP
            if (totalWrappedAssetUsdValue.gt(0)) {
              const metadata: Metadata | undefined = STORE_METADATA
                ? {
                    componentAddress,
                    tokenPair,
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
                  }
                : undefined;

              output.push({
                activityId,
                usdValue: totalWrappedAssetUsdValue,
                metadata,
              });
            }

            // Process native LP
            if (totalNativeAssetUsdValue.gt(0)) {
              const metadata: Metadata | undefined = STORE_METADATA
                ? {
                    componentAddress,
                    tokenPair,
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
                  }
                : undefined;

              output.push({
                activityId,
                usdValue: totalNativeAssetUsdValue,
                metadata,
              });
            }

            return output;
          })
        );

        const aggregatedData = result.flat().reduce((acc, curr) => {
          const existing = acc.get(curr.activityId);
          if (existing) {
            const newTotalValue = new BigNumber(existing.usdValue).plus(
              curr.usdValue
            );
            acc.set(curr.activityId, {
              ...existing,
              usdValue: newTotalValue.toString(),
              metadata: {
                ...curr.metadata,
                note: "Aggregated from multiple positions",
              },
            });
          } else {
            acc.set(curr.activityId, {
              activityId: curr.activityId,
              usdValue: curr.usdValue.toString(),
              metadata: curr.metadata,
            });
          }

          return acc;
        }, new Map<ActivityId, AccountBalanceData>());

        return aggregatedData;
      });

      return Effect.fn("AggregateDefiPlazaPositionsService")(function* (input: {
        accountBalance: DefiPlazaPositions;
        timestamp: Date;
      }) {
        // Create default values for all pools
        const defaultValues = yield* createDefaultValues();

        // Process positions
        const processedPositions = yield* processDefiPlazaPositions({
          positions: input.accountBalance.items,
          timestamp: input.timestamp,
        });

        // Merge processed positions with defaults
        const mergedPositions = processedPositions
          .entries()
          .reduce((acc, [activityId, value]) => {
            acc.set(activityId, value);
            return acc;
          }, defaultValues);

        return Array.from(mergedPositions.values());
      });
    }),
  }
) {}

export const AggregateDefiPlazaPositionsLive =
  AggregateDefiPlazaPositionsService.Default;

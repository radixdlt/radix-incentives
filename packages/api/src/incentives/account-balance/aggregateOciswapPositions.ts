import { Config, Effect } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { GetUsdValueService } from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import {
  DappConstants,
  type ActivityId,
  type Token,
  type AccountBalanceData,
  getTokenPair,
} from "data";
import {
  AddressValidationService,
  CONSTANT_PRODUCT_MULTIPLIER,
} from "../../common/address-validation/addressValidation";

import type { OciswapLiquidityAsset } from "../../common/dapps/ociswap/getOciswapLiquidityAssets";
import type { OciswapResourcePoolLiquidityAsset } from "../../common/dapps/ociswap/getOciswapResourcePoolPositions";
import { determineLpActivityId } from "./determineLpActivityId";

const OciswapConstants = DappConstants.Ociswap.constants;

export type AggregateOciswapPositionsOutput = Effect.Effect.Success<
  ReturnType<typeof AggregateOciswapPositionsService.Service>
>;

type OciswapPool = OciswapLiquidityAsset | OciswapResourcePoolLiquidityAsset;

type OciswapPoolEntity = {
  poolKey: string;
  poolAssets: OciswapPool[];
};

const allOciswapPools = [
  ...Object.values(OciswapConstants.pools),
  ...Object.values(OciswapConstants.poolsV2),
  ...Object.values(OciswapConstants.flexPools),
  ...Object.values(OciswapConstants.basicPools),
];

type TokenPair = string;

type TokenInfo = {
  name: string;
  isNativeAsset: boolean;
  resourceAddress: string;
};

type AggregatedPoolItem = {
  tokenPair: TokenPair;
  activityId: ActivityId;
  isNativeLp: boolean;
  pools: OciswapPoolEntity[];
  xTokenInfo: TokenInfo;
  yTokenInfo: TokenInfo;
};

type PoolData = {
  poolKey: string;
  poolAssets: OciswapPool[];
  poolTotals: {
    totalXToken: BigNumber;
    totalYToken: BigNumber;
    totalXTokenOutsidePriceBounds: BigNumber;
    totalYTokenOutsidePriceBounds: BigNumber;
  };
  xTokenUsdValue: BigNumber;
  yTokenUsdValue: BigNumber;
  poolMultiplier: number;
  poolUsdValue: BigNumber;
};

type Metadata = {
  componentAddress: string;
  tokenPair: string;
  baseToken: {
    resourceAddress: string;
    amount: string;
    outsidePriceBounds: string;
    isNativeAsset: boolean;
  };
  quoteToken: {
    resourceAddress: string;
    amount: string;
    outsidePriceBounds: string;
    isNativeAsset: boolean;
  };
};

export class AggregateOciswapPositionsService extends Effect.Service<AggregateOciswapPositionsService>()(
  "AggregateOciswapPositionsService",
  {
    effect: Effect.gen(function* () {
      const STORE_METADATA = Config.boolean("storeMetadata").pipe(
        Config.withDefault(true)
      );
      const getUsdValueService = yield* GetUsdValueService;
      const addressValidationService = yield* AddressValidationService;

      const createDefaultValues = Effect.fn(function* () {
        return yield* Effect.forEach(
          allOciswapPools,
          Effect.fn(function* (pool) {
            const xTokenInfo =
              yield* addressValidationService.getTokenNameAndNativeAssetStatus(
                pool.token_x
              );

            const yTokenInfo =
              yield* addressValidationService.getTokenNameAndNativeAssetStatus(
                pool.token_y
              );

            const tokenPair = getTokenPair(xTokenInfo.name, yTokenInfo.name);

            const { activityId, isNativeLp } = yield* determineLpActivityId(
              "oci",
              tokenPair
            );

            // Get XRD derivative status from the centralized function
            const isXTokenNativeAsset = xTokenInfo.isNativeAsset;
            const isYTokenNativeAsset = yTokenInfo.isNativeAsset;

            return STORE_METADATA
              ? {
                  activityId,
                  isNativeLp,
                  usdValue: "0",
                  metadata: {
                    tokenPair,
                    baseToken: {
                      resourceAddress: pool.token_x,
                      amount: "0",
                      outsidePriceBounds: "0",
                      isNativeAsset: isXTokenNativeAsset,
                    },
                    quoteToken: {
                      resourceAddress: pool.token_y,
                      amount: "0",
                      outsidePriceBounds: "0",
                      isNativeAsset: isYTokenNativeAsset,
                    },
                  },
                }
              : {
                  activityId,
                  isNativeLp,
                  usdValue: "0",
                };
          }),
          { concurrency: "unbounded" }
        ).pipe(
          Effect.map((a) =>
            a.reduce((acc, curr) => {
              acc.set(curr.activityId, curr);
              return acc;
            }, new Map<ActivityId, AccountBalanceData>())
          )
        );
      });

      const aggregatePools = Effect.fn(function* (
        input: AccountBalanceFromSnapshot
      ) {
        const poolsByTokenPair = yield* Effect.forEach(
          Object.entries(input.ociswapPositions),
          Effect.fn(function* ([poolKey, poolAssets]) {
            const firstAsset = poolAssets[0];

            if (!firstAsset || poolAssets.length === 0) {
              return;
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

            const tokenPair = getTokenPair(xTokenInfo.name, yTokenInfo.name);

            const { activityId, isNativeLp } = yield* determineLpActivityId(
              "oci",
              tokenPair
            );

            return {
              tokenPair,
              activityId,
              isNativeLp,
              pool: { poolKey, poolAssets },
              xTokenInfo: {
                ...xTokenInfo,
                resourceAddress: xToken.resourceAddress,
              },
              yTokenInfo: {
                ...yTokenInfo,
                resourceAddress: yToken.resourceAddress,
              },
            };
          }),
          { concurrency: "unbounded" }
        ).pipe(
          Effect.map((pools) =>
            pools.reduce((acc, pool) => {
              if (!pool) {
                return acc;
              }

              const existingPool = acc.get(pool.tokenPair);

              if (!existingPool) {
                acc.set(pool.tokenPair, {
                  tokenPair: pool.tokenPair,
                  activityId: pool.activityId,
                  isNativeLp: pool.isNativeLp,
                  pools: [pool.pool],
                  xTokenInfo: pool.xTokenInfo,
                  yTokenInfo: pool.yTokenInfo,
                });
              } else {
                existingPool.pools.push(pool.pool);
              }
              return acc;
            }, new Map<TokenPair, AggregatedPoolItem>())
          )
        );

        return poolsByTokenPair;
      });

      const calculatePoolTotals = Effect.fn(function* (
        poolAssets: OciswapPool[]
      ) {
        return yield* Effect.forEach(
          poolAssets,
          Effect.fn(function* (poolAsset) {
            const { xToken, yToken } = poolAsset;

            const xTokenAmountInBounds = xToken.amountInBounds;
            const yTokenAmountInBounds = yToken.amountInBounds;

            const xTokenOutsidePriceBounds = new BigNumber(
              xToken.totalAmount
            ).minus(xTokenAmountInBounds);
            const yTokenOutsidePriceBounds = new BigNumber(
              yToken.totalAmount
            ).minus(yTokenAmountInBounds);

            return {
              xTokenAmountInBounds,
              yTokenAmountInBounds,
              xTokenOutsidePriceBounds,
              yTokenOutsidePriceBounds,
            };
          })
        ).pipe(
          Effect.map((items) =>
            items.reduce(
              (acc, curr) => {
                acc.totalXToken = acc.totalXToken.plus(
                  curr.xTokenAmountInBounds
                );
                acc.totalXTokenOutsidePriceBounds =
                  acc.totalXTokenOutsidePriceBounds.plus(
                    curr.xTokenOutsidePriceBounds
                  );
                acc.totalYToken = acc.totalYToken.plus(
                  curr.yTokenAmountInBounds
                );
                acc.totalYTokenOutsidePriceBounds =
                  acc.totalYTokenOutsidePriceBounds.plus(
                    curr.yTokenOutsidePriceBounds
                  );
                return acc;
              },
              {
                totalXToken: new BigNumber(0),
                totalXTokenOutsidePriceBounds: new BigNumber(0),
                totalYToken: new BigNumber(0),
                totalYTokenOutsidePriceBounds: new BigNumber(0),
              }
            )
          )
        );
      });

      const getPoolData = Effect.fn(function* (
        pool: OciswapPoolEntity,
        xTokenInfo: TokenInfo,
        yTokenInfo: TokenInfo,
        timestamp: Date
      ) {
        const { poolKey, poolAssets } = pool;

        const poolTotals = yield* calculatePoolTotals(poolAssets);

        const isPoolConstantProduct =
          addressValidationService.isConstantProductPool(poolKey);

        const poolMultiplier = isPoolConstantProduct
          ? CONSTANT_PRODUCT_MULTIPLIER
          : 1;

        // Calculate USD values for this pool
        const xTokenUsdValue = poolTotals.totalXToken.isZero()
          ? new BigNumber(0)
          : yield* getUsdValueService({
              amount: poolTotals.totalXToken,
              resourceAddress: xTokenInfo.resourceAddress,
              timestamp,
            });

        const yTokenUsdValue = poolTotals.totalYToken.isZero()
          ? new BigNumber(0)
          : yield* getUsdValueService({
              amount: poolTotals.totalYToken,
              resourceAddress: yTokenInfo.resourceAddress,
              timestamp,
            });

        const poolUsdValue = xTokenUsdValue
          .plus(yTokenUsdValue)
          .multipliedBy(poolMultiplier);

        return {
          poolKey,
          poolAssets,
          poolTotals,
          poolMultiplier,
          xTokenUsdValue,
          yTokenUsdValue,
          poolUsdValue,
        } satisfies PoolData;
      });

      const precalculatePoolData = Effect.fn(function* (input: {
        item: AggregatedPoolItem;
        timestamp: Date;
      }) {
        const { item, timestamp } = input;

        const { pools, xTokenInfo, yTokenInfo } = item;

        const poolData = yield* Effect.forEach(
          pools,
          Effect.fn(function* (pool) {
            return yield* getPoolData(pool, xTokenInfo, yTokenInfo, timestamp);
          })
        );

        const totalsAcrossPools = poolData.reduce(
          (acc, curr) => {
            acc.totalUsdValue = acc.totalUsdValue.plus(curr.poolUsdValue);
            acc.totalXToken = acc.totalXToken.plus(curr.poolTotals.totalXToken);
            acc.totalYToken = acc.totalYToken.plus(curr.poolTotals.totalYToken);
            acc.totalXTokenOutsidePriceBounds =
              acc.totalXTokenOutsidePriceBounds.plus(
                curr.poolTotals.totalXTokenOutsidePriceBounds
              );
            acc.totalYTokenOutsidePriceBounds =
              acc.totalYTokenOutsidePriceBounds.plus(
                curr.poolTotals.totalYTokenOutsidePriceBounds
              );

            return acc;
          },
          {
            totalUsdValue: new BigNumber(0),
            totalXToken: new BigNumber(0),
            totalYToken: new BigNumber(0),
            totalXTokenOutsidePriceBounds: new BigNumber(0),
            totalYTokenOutsidePriceBounds: new BigNumber(0),
          }
        );

        return {
          ...totalsAcrossPools,
          poolData,
        };
      });

      const processAggregatedPoolItem = Effect.fn(function* (input: {
        aggregatedPoolItem: AggregatedPoolItem;
        timestamp: Date;
      }) {
        const { aggregatedPoolItem } = input;
        const isXTokenNativeAsset = aggregatedPoolItem.xTokenInfo.isNativeAsset;
        const isYTokenNativeAsset = aggregatedPoolItem.yTokenInfo.isNativeAsset;
        const xTokenName = aggregatedPoolItem.xTokenInfo.name;
        const yTokenName = aggregatedPoolItem.yTokenInfo.name;

        const { poolData, totalUsdValue, totalXToken, totalYToken } =
          yield* precalculatePoolData({
            item: aggregatedPoolItem,
            timestamp: input.timestamp,
          });

        const poolShares: Record<string, number> = {};

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
              resourceAddress: aggregatedPoolItem.xTokenInfo.resourceAddress,
              timestamp: input.timestamp,
            })
          : new BigNumber(0);

        const yTokenUsdValue = totalYToken.gt(0)
          ? yield* getUsdValueService({
              amount: totalYToken,
              resourceAddress: aggregatedPoolItem.yTokenInfo.resourceAddress,
              timestamp: input.timestamp,
            })
          : new BigNumber(0);

        // Calculate wrapped and native asset portions from the totalUsdValue
        const wrappedAssetPortion = new BigNumber(0)
          .plus(isXTokenNativeAsset ? 0 : xTokenUsdValue)
          .plus(isYTokenNativeAsset ? 0 : yTokenUsdValue);

        const nativeAssetPortion = new BigNumber(0)
          .plus(isXTokenNativeAsset ? xTokenUsdValue : 0)
          .plus(isYTokenNativeAsset ? yTokenUsdValue : 0);

        const totalPortion = wrappedAssetPortion.plus(nativeAssetPortion);

        // Calculate final USD values using the already-multiplied totalUsdValue
        const finalNonXrdUsdValue = totalPortion.gt(0)
          ? totalUsdValue
              .multipliedBy(wrappedAssetPortion)
              .dividedBy(totalPortion)
          : new BigNumber(0);

        const finalNativeAssetUsdValue = totalPortion.gt(0)
          ? totalUsdValue
              .multipliedBy(nativeAssetPortion)
              .dividedBy(totalPortion)
          : new BigNumber(0);

        // Create separate metadata for each pool using pre-calculated data
        const poolMetadata: Record<string, Metadata> = {};

        if (STORE_METADATA) {
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
        }

        const activityId = aggregatedPoolItem.activityId;
        const isNativeLp = aggregatedPoolItem.isNativeLp;
        const usdValue = (
          isNativeLp ? finalNativeAssetUsdValue : finalNonXrdUsdValue
        ).toString();
        const poolShare =
          Object.keys(poolShares).length > 1 ? poolShares : undefined;
        const metadata = STORE_METADATA ? poolMetadata : undefined;

        return {
          activityId,
          usdValue,
          poolShare,
          metadata,
        };
      });

      return Effect.fn("AggregateOciswapPositionsService")(function* (input: {
        accountBalance: AccountBalanceFromSnapshot;
        timestamp: Date;
      }) {
        // Aggregate pools by token pair
        const poolsByTokenPair = yield* aggregatePools(input.accountBalance);

        const defaults = yield* createDefaultValues();

        // Second pass: process each token pair
        const processedItems = yield* Effect.forEach(
          poolsByTokenPair.values(),
          Effect.fn(function* (aggregatedPoolItem) {
            return yield* processAggregatedPoolItem({
              aggregatedPoolItem,
              timestamp: input.timestamp,
            });
          })
        ).pipe(
          Effect.map((item) =>
            item.reduce((acc, curr) => {
              acc.set(curr.activityId, curr);
              return acc;
            }, defaults)
          )
        );

        return processedItems;
      });
    }),
  }
) {}

export const AggregateOciswapPositionsLive =
  AggregateOciswapPositionsService.Default;

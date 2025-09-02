import { BigNumber } from 'bignumber.js';
import {
  type AccountBalanceData,
  Action,
  type DappId,
  deriveHoldActivityId,
  deriveLpActivityId,
  getTokenDetailsFromResourceAddress,
  getTokenPairFromResourceAddresses,
  type TokenDetails,
} from 'data';
import { Config, Effect } from 'effect';
import { groupBy } from 'effect/Array';

import {
  AddressValidationService,
  AddressValidationServiceLive,
  CONSTANT_PRODUCT_MULTIPLIER,
} from '../../common/address-validation/addressValidation';
import { GetUsdValueService } from '../token-price/getUsdValue';
import { getDefaultPositions } from './getDefaultPositions';

export type LpPosition = {
  componentAddress: string;
  xToken: {
    resourceAddress: string;
    withinPriceBounds: string;
    outsidePriceBounds: string;
  };
  yToken: {
    resourceAddress: string;
    withinPriceBounds: string;
    outsidePriceBounds: string;
  };
};

export class AggregatePoolPositionsService extends Effect.Service<AggregatePoolPositionsService>()(
  'AggregatePoolPositionsService',
  {
    dependencies: [GetUsdValueService.Default, AddressValidationServiceLive],
    effect: Effect.gen(function* () {
      const STORE_METADATA = yield* Config.boolean('DEBUG_STORE_METADATA').pipe(
        Config.withDefault(false),
      );
      const getUsdValueService = yield* GetUsdValueService;
      const addressValidationService = yield* AddressValidationService;

      const calculatePoolPositionTotals = Effect.fn(function* (
        positions: LpPosition[],
      ) {
        return positions.reduce(
          (acc, item) => {
            acc.totalXTokenWithinPriceBounds =
              acc.totalXTokenWithinPriceBounds.plus(
                item.xToken.withinPriceBounds,
              );
            acc.totalXTokenOutsidePriceBounds =
              acc.totalXTokenOutsidePriceBounds.plus(
                item.xToken.outsidePriceBounds,
              );
            acc.totalYTokenWithinPriceBounds =
              acc.totalYTokenWithinPriceBounds.plus(
                item.yToken.withinPriceBounds,
              );
            acc.totalYTokenOutsidePriceBounds =
              acc.totalYTokenOutsidePriceBounds.plus(
                item.yToken.outsidePriceBounds,
              );
            return acc;
          },
          {
            totalXTokenWithinPriceBounds: new BigNumber(0),
            totalYTokenWithinPriceBounds: new BigNumber(0),
            totalXTokenOutsidePriceBounds: new BigNumber(0),
            totalYTokenOutsidePriceBounds: new BigNumber(0),
          },
        );
      });

      const aggregatePoolPositions = Effect.fn(function* (
        positions: LpPosition[],
        dAppId: DappId,
      ) {
        const groupedByComponentAddress = groupBy(
          positions,
          (position) => position.componentAddress,
        );

        const aggregatedPoolPositions = yield* Effect.forEach(
          Object.entries(groupedByComponentAddress),
          Effect.fn(function* ([componentAddress, poolPositions]) {
            if (poolPositions.length === 0) return;

            const { xToken, yToken } = poolPositions[0]!;

            const poolTotals =
              yield* calculatePoolPositionTotals(poolPositions);

            const xTokenDetails = yield* getTokenDetailsFromResourceAddress(
              xToken.resourceAddress,
            );

            const yTokenDetails = yield* getTokenDetailsFromResourceAddress(
              yToken.resourceAddress,
            );

            const { tokenPair } = yield* getTokenPairFromResourceAddresses(
              xToken.resourceAddress,
              yToken.resourceAddress,
            );

            const isSingleTokenPool =
              xTokenDetails.resourceAddress === yTokenDetails.resourceAddress;

            const xTokenLpActivityId = deriveLpActivityId({
              dAppId,
              tokenPair,
              tokenDetails: xTokenDetails,
              isSingleTokenPool,
            });

            const yTokenLpActivityId = deriveLpActivityId({
              dAppId,
              tokenPair,
              tokenDetails: yTokenDetails,
              isSingleTokenPool,
            });

            const xTokenHoldActivityId = deriveHoldActivityId({
              dAppId,
              tokenPair,
              tokenDetails: xTokenDetails,
              isSingleTokenPool,
            });

            const yTokenHoldActivityId = deriveHoldActivityId({
              dAppId,
              tokenPair,
              tokenDetails: yTokenDetails,
              isSingleTokenPool,
            });

            const lpActivities = [
              {
                activityId: xTokenLpActivityId,
                componentAddress,
                token: xTokenDetails,
                totalWithinPriceBounds: poolTotals.totalXTokenWithinPriceBounds,
                totalOutsidePriceBounds:
                  poolTotals.totalXTokenOutsidePriceBounds,
              },
              {
                activityId: yTokenLpActivityId,
                componentAddress,
                token: yTokenDetails,
                totalWithinPriceBounds: poolTotals.totalYTokenWithinPriceBounds,
                totalOutsidePriceBounds:
                  poolTotals.totalYTokenOutsidePriceBounds,
              },
            ];

            const holdActivities = [
              {
                activityId: xTokenHoldActivityId,
                componentAddress,
                token: xTokenDetails,
                totalWithinPriceBounds:
                  poolTotals.totalXTokenWithinPriceBounds.plus(
                    poolTotals.totalXTokenOutsidePriceBounds,
                  ),
                totalOutsidePriceBounds: new BigNumber(0),
              },
              {
                activityId: yTokenHoldActivityId,
                componentAddress,
                token: yTokenDetails,
                totalWithinPriceBounds:
                  poolTotals.totalYTokenWithinPriceBounds.plus(
                    poolTotals.totalYTokenOutsidePriceBounds,
                  ),
                totalOutsidePriceBounds: new BigNumber(0),
              },
            ];

            return {
              lpActivities,
              holdActivities,
            };
          }),
        ).pipe(
          Effect.map((items) => items.filter((item) => item !== undefined)),
          Effect.map((items) =>
            items.reduce(
              (acc, item) => {
                acc.lpActivities.push(...item.lpActivities);
                acc.holdActivities.push(...item.holdActivities);
                return acc;
              },
              { lpActivities: [], holdActivities: [] },
            ),
          ),
        );

        return aggregatedPoolPositions;
      });

      const processAggregatedPoolPositions = Effect.fn(function* (
        items: {
          activityId: string;
          componentAddress: string;
          token: TokenDetails;
          totalWithinPriceBounds: BigNumber;
          totalOutsidePriceBounds: BigNumber;
        }[],
        timestamp: Date,
        _applyMultiplier: boolean,
      ) {
        const groupedByActivityId = groupBy(items, (item) => item.activityId);

        const aggregatedByActivityId: AccountBalanceData[] =
          yield* Effect.forEach(
            Object.entries(groupedByActivityId),
            Effect.fn(function* ([activityId, items]) {
              const withUsdValue = yield* Effect.forEach(
                items,
                Effect.fn(function* (item) {
                  const isPoolConstantProduct =
                    addressValidationService.isConstantProductPool(
                      item.componentAddress,
                    );

                  const totalXTokenUsdValue = item.totalWithinPriceBounds.gt(0)
                    ? yield* getUsdValueService({
                        amount: item.totalWithinPriceBounds,
                        resourceAddress: item.token.resourceAddress,
                        timestamp,
                      }).pipe(
                        Effect.map((usdValue) => {
                          if (isPoolConstantProduct) {
                            return usdValue.multipliedBy(
                              CONSTANT_PRODUCT_MULTIPLIER,
                            );
                          }
                          return usdValue;
                        }),
                      )
                    : new BigNumber(0);

                  return {
                    usdValue: totalXTokenUsdValue,
                    metadata: item,
                  };
                }),
              );

              const usdValue = withUsdValue
                .reduce((acc, item) => {
                  return acc.plus(item.usdValue);
                }, new BigNumber(0))
                .toString();

              const metadata = withUsdValue
                .map(({ metadata }) => {
                  if (!metadata) return;
                  const {
                    totalOutsidePriceBounds,
                    totalWithinPriceBounds,
                    ...rest
                  } = metadata;

                  return {
                    ...rest,
                    totalOutsidePriceBounds: totalOutsidePriceBounds.toString(),
                    totalWithinPriceBounds: totalWithinPriceBounds.toString(),
                  };
                })
                .filter((item) => item !== undefined);

              return {
                activityId,
                usdValue,
                metadata: STORE_METADATA ? { items: metadata } : undefined,
              } satisfies AccountBalanceData;
            }),
          );

        const output = new Map<string, AccountBalanceData>(
          aggregatedByActivityId.map((item) => [item.activityId, item]),
        );

        return output;
      });

      return {
        aggregate: Effect.fn(function* (input: {
          positions: LpPosition[];
          dAppId: DappId;
          timestamp: Date;
        }) {
          const { positions, dAppId, timestamp } = input;

          const defaultValues = yield* getDefaultPositions(dAppId, [
            Action.HOLD,
            Action.LP,
          ]);

          // aggregate pool positions by componentAddress, add pool totals and derive activityId
          const { lpActivities, holdActivities } =
            yield* aggregatePoolPositions(positions, dAppId);

          // aggregate pool positions by activityId and calculate usd value
          const processedLpPoolPositions =
            yield* processAggregatedPoolPositions(
              lpActivities,
              timestamp,
              true,
            );

          const processedHoldPositions = yield* processAggregatedPoolPositions(
            holdActivities,
            timestamp,
            false,
          );

          // add default values for positions that were not processed
          return defaultValues.map((item) => {
            const processedLpItem = processedLpPoolPositions.get(
              item.activityId,
            );
            if (processedLpItem) return processedLpItem;

            const processedHoldItem = processedHoldPositions.get(
              item.activityId,
            );
            if (processedHoldItem) return processedHoldItem;

            return item;
          });
        }),
      };
    }),
  },
) {}

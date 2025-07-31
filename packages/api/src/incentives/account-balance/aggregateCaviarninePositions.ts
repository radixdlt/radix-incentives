import { Config, Effect } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { GetUsdValueService } from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";

import {
  Action,
  activityDataByDappId,
  DappConstants,
  DappId,
  deriveLpActivityId,
  getTokenDetailsFromResourceAddress,
  getTokenPairFromResourceAddresses,
} from "data";
import type { AccountBalanceData, TokenDetails } from "data";
import {
  AddressValidationService,
  CONSTANT_PRODUCT_MULTIPLIER,
} from "../../common/address-validation/addressValidation";

import { groupBy } from "effect/Array";

const CaviarNineConstants = DappConstants.CaviarNine.constants;

export type AggregateCaviarninePositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

type Position = {
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

export class AggregateCaviarninePositionsService extends Effect.Service<AggregateCaviarninePositionsService>()(
  "AggregateCaviarninePositionsService",
  {
    effect: Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;
      const addressValidationService = yield* AddressValidationService;

      const STORE_METADATA = yield* Config.boolean("DEBUG_STORE_METADATA").pipe(
        Config.withDefault(false)
      );

      const caviarnineLpActivities = activityDataByDappId.c9.filter(
        (activity) => activity.action === Action.LP
      );

      const caviarnineDefaultPositions: AccountBalanceData[] =
        caviarnineLpActivities.map((activity) => ({
          activityId: activity.activityId,
          usdValue: "0",
        }));

      const createDefaultValues = Effect.fn(function* () {
        return structuredClone(caviarnineDefaultPositions);
      });

      const calculatePoolPositionTotals = Effect.fn(function* (
        positions: Position[]
      ) {
        return positions.reduce(
          (acc, item) => {
            acc.totalXTokenWithinPriceBounds =
              acc.totalXTokenWithinPriceBounds.plus(
                item.xToken.withinPriceBounds
              );
            acc.totalXTokenOutsidePriceBounds =
              acc.totalXTokenOutsidePriceBounds.plus(
                item.xToken.outsidePriceBounds
              );
            acc.totalYTokenWithinPriceBounds =
              acc.totalYTokenWithinPriceBounds.plus(
                item.yToken.withinPriceBounds
              );
            acc.totalYTokenOutsidePriceBounds =
              acc.totalYTokenOutsidePriceBounds.plus(
                item.yToken.outsidePriceBounds
              );
            return acc;
          },
          {
            totalXTokenWithinPriceBounds: new BigNumber(0),
            totalYTokenWithinPriceBounds: new BigNumber(0),
            totalXTokenOutsidePriceBounds: new BigNumber(0),
            totalYTokenOutsidePriceBounds: new BigNumber(0),
          }
        );
      });

      const normalizePoolPositions = Effect.fn(function* (
        input: AggregateCaviarninePositionsInput
      ) {
        // normalise hyperstake positions to be in the same format as caviarnine positions
        const hyperstakePositions =
          input.accountBalance.hyperstakePositions.items.flatMap((item) => {
            return item.position.map((position) => ({
              componentAddress: CaviarNineConstants.HLP.componentAddress,
              xToken: {
                resourceAddress: CaviarNineConstants.HLP.token_x,
                withinPriceBounds:
                  position.resourceAddress === CaviarNineConstants.HLP.token_x
                    ? position.amount.toString()
                    : "0",
                outsidePriceBounds: "0",
              },
              yToken: {
                resourceAddress: CaviarNineConstants.HLP.token_y,
                withinPriceBounds:
                  position.resourceAddress === CaviarNineConstants.HLP.token_y
                    ? position.amount.toString()
                    : "0",
                outsidePriceBounds: "0",
              },
            }));
          });

        const caviarninePositions = Object.entries(
          input.accountBalance.caviarninePositions
        ).flatMap(([componentAddress, poolPositions]) =>
          poolPositions.map((poolPosition) => ({
            componentAddress,
            xToken: {
              resourceAddress: poolPosition.xToken.resourceAddress,
              withinPriceBounds: poolPosition.xToken.withinPriceBounds,
              outsidePriceBounds: poolPosition.xToken.outsidePriceBounds,
            },
            yToken: {
              resourceAddress: poolPosition.yToken.resourceAddress,
              withinPriceBounds: poolPosition.yToken.withinPriceBounds,
              outsidePriceBounds: poolPosition.yToken.outsidePriceBounds,
            },
          }))
        );

        const allPositions: Position[] = [
          ...hyperstakePositions,
          ...caviarninePositions,
        ];

        return allPositions;
      });

      const aggregatePoolPositions = Effect.fn(function* (
        positions: Position[]
      ) {
        const groupedByComponentAddress = groupBy(
          positions,
          (position) => position.componentAddress
        );

        const aggregatedPoolPositions = yield* Effect.forEach(
          Object.entries(groupedByComponentAddress),
          Effect.fn(function* ([componentAddress, poolPositions]) {
            if (poolPositions.length === 0) return;

            const { xToken, yToken } = poolPositions[0]!;

            const poolTotals =
              yield* calculatePoolPositionTotals(poolPositions);

            const xTokenDetails = yield* getTokenDetailsFromResourceAddress(
              xToken.resourceAddress
            );

            const yTokenDetails = yield* getTokenDetailsFromResourceAddress(
              yToken.resourceAddress
            );

            const { tokenPair } = yield* getTokenPairFromResourceAddresses(
              xToken.resourceAddress,
              yToken.resourceAddress
            );

            const isSingleTokenPool =
              xTokenDetails.resourceAddress === yTokenDetails.resourceAddress;

            const xTokenActivityId = deriveLpActivityId({
              dAppId: DappId.caviarnine,
              tokenPair,
              tokenDetails: xTokenDetails,
              isSingleTokenPool,
            });

            const yTokenActivityId = deriveLpActivityId({
              dAppId: DappId.caviarnine,
              tokenPair,
              tokenDetails: yTokenDetails,
              isSingleTokenPool,
            });

            return [
              {
                activityId: xTokenActivityId,
                componentAddress,
                token: xTokenDetails,
                totalWithinPriceBounds: poolTotals.totalXTokenWithinPriceBounds,
                totalOutsidePriceBounds:
                  poolTotals.totalXTokenOutsidePriceBounds,
              },
              {
                activityId: yTokenActivityId,
                componentAddress,
                token: yTokenDetails,
                totalWithinPriceBounds: poolTotals.totalYTokenWithinPriceBounds,
                totalOutsidePriceBounds:
                  poolTotals.totalYTokenOutsidePriceBounds,
              },
            ];
          })
        ).pipe(
          Effect.map((items) =>
            items.flat().filter((item) => item !== undefined)
          )
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
        timestamp: Date
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
                      item.componentAddress
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
                              CONSTANT_PRODUCT_MULTIPLIER
                            );
                          }
                          return usdValue;
                        })
                      )
                    : new BigNumber(0);

                  return {
                    usdValue: totalXTokenUsdValue,
                    metadata: item,
                  };
                })
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
                    activityId,
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
            })
          );

        const output = new Map<string, AccountBalanceData>(
          aggregatedByActivityId.map((item) => [item.activityId, item])
        );

        return output;
      });

      return Effect.fn("aggregateCaviarninePositions")(function* (
        input: AggregateCaviarninePositionsInput
      ) {
        const defaultValues = yield* createDefaultValues();

        // normalise pool positions
        const normalizedPoolPositions = yield* normalizePoolPositions(input);

        // aggregate pool positions by componentAddress, add pool totals and derive activityId
        const aggregatedPoolPositions = yield* aggregatePoolPositions(
          normalizedPoolPositions
        );

        // aggregate pool positions by activityId and calculate usd value
        const processedPoolPositions = yield* processAggregatedPoolPositions(
          aggregatedPoolPositions,
          input.timestamp
        );

        // add default values for caviarnine positions that were not processed
        const withDefaultValues = defaultValues.map((item) => {
          const processedItem = processedPoolPositions.get(item.activityId);
          if (!processedItem) return item;
          return processedItem;
        });

        return withDefaultValues;
      });
    }),
  }
) {}

export const AggregateCaviarninePositionsLive =
  AggregateCaviarninePositionsService.Default;

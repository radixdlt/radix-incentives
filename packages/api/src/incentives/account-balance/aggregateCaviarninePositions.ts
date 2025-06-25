import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import type { AccountBalanceData, ActivityId } from "db/incentives";
import {
  TokenNameService,
  type UnknownTokenError,
} from "../../common/token-name/getTokenName";

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
    GetUsdValueServiceError | UnknownTokenError,
    GetUsdValueService | TokenNameService
  >
>() {}

export const AggregateCaviarninePositionsLive = Layer.effect(
  AggregateCaviarninePositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    const tokenNameService = yield* TokenNameService;
    return (input) =>
      Effect.gen(function* () {
        const results: AccountBalanceData[] = [];

        // Process each pool in the CaviarNine positions
        for (const [_poolKey, poolAssets] of Object.entries(
          input.accountBalance.caviarninePositions
        )) {
          const firstAsset = poolAssets[0];

          if (!firstAsset || poolAssets.length === 0) {
            continue;
          }

          const { xToken, yToken } = firstAsset;

          // Determine which tokens are XRD and which are not
          const isXTokenXrd = xToken.resourceAddress === Assets.Fungible.XRD;
          const isYTokenXrd = yToken.resourceAddress === Assets.Fungible.XRD;

          // Get token names for the pair
          const xTokenName = yield* tokenNameService(xToken.resourceAddress);
          const yTokenName = yield* tokenNameService(yToken.resourceAddress);
          const tokenPair = `${xTokenName}_${yTokenName}`;

          const totals = poolAssets.reduce(
            (acc, item) => {
              acc.totalXToken = acc.totalXToken.plus(
                item.xToken.withinPriceBounds
              );
              acc.totalYToken = acc.totalYToken.plus(
                item.yToken.withinPriceBounds
              );
              return acc;
            },
            { totalXToken: new BigNumber(0), totalYToken: new BigNumber(0) }
          );

          // Calculate USD value of all non-XRD tokens
          let totalNonXrdUsdValue = new BigNumber(0);

          // Add xToken value if it's not XRD
          if (!isXTokenXrd && totals.totalXToken.gt(0)) {
            const xTokenUsdValue = yield* getUsdValueService({
              amount: totals.totalXToken,
              resourceAddress: xToken.resourceAddress,
              timestamp: input.timestamp,
            });
            totalNonXrdUsdValue = totalNonXrdUsdValue.plus(xTokenUsdValue);
          }

          // Add yToken value if it's not XRD
          if (!isYTokenXrd && totals.totalYToken.gt(0)) {
            const yTokenUsdValue = yield* getUsdValueService({
              amount: totals.totalYToken,
              resourceAddress: yToken.resourceAddress,
              timestamp: input.timestamp,
            });
            totalNonXrdUsdValue = totalNonXrdUsdValue.plus(yTokenUsdValue);
          }

          // Generate activity ID based on token pair - cast to ActivityId since we know it's valid
          const activityId = `c9_lp_${xTokenName}-${yTokenName}` as ActivityId;

          results.push({
            activityId,
            usdValue: totalNonXrdUsdValue.toString(),
            metadata: {
              tokenPair,
              baseToken: {
                resourceAddress: xToken.resourceAddress,
                amount: totals.totalXToken.toString(),
                isXrd: isXTokenXrd,
              },
              quoteToken: {
                resourceAddress: yToken.resourceAddress,
                amount: totals.totalYToken.toString(),
                isXrd: isYTokenXrd,
              },
            },
          });
        }

        return results;
      });
  })
);

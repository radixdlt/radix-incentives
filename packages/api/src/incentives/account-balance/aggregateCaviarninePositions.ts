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
    GetUsdValueServiceError | UnknownTokenError
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

          // Determine which tokens are XRD derivatives (XRD or LSULP)
          const isXTokenXrdDerivative =
            xToken.resourceAddress === Assets.Fungible.XRD ||
            xToken.resourceAddress ===
              CaviarNineConstants.LSULP.resourceAddress;
          const isYTokenXrdDerivative =
            yToken.resourceAddress === Assets.Fungible.XRD ||
            yToken.resourceAddress ===
              CaviarNineConstants.LSULP.resourceAddress;

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

          // Calculate USD value of all non-XRD derivative tokens
          let totalNonXrdDerivativeUsdValue = new BigNumber(0);

          // Add xToken value if it's not an XRD derivative
          if (!isXTokenXrdDerivative && totals.totalXToken.gt(0)) {
            const xTokenUsdValue = yield* getUsdValueService({
              amount: totals.totalXToken,
              resourceAddress: xToken.resourceAddress,
              timestamp: input.timestamp,
            });
            totalNonXrdDerivativeUsdValue =
              totalNonXrdDerivativeUsdValue.plus(xTokenUsdValue);
          }

          // Add yToken value if it's not an XRD derivative
          if (!isYTokenXrdDerivative && totals.totalYToken.gt(0)) {
            const yTokenUsdValue = yield* getUsdValueService({
              amount: totals.totalYToken,
              resourceAddress: yToken.resourceAddress,
              timestamp: input.timestamp,
            });
            totalNonXrdDerivativeUsdValue =
              totalNonXrdDerivativeUsdValue.plus(yTokenUsdValue);
          }

          // Generate activity ID based on token pair - cast to ActivityId since we know it's valid
          const activityId = `c9_lp_${xTokenName}-${yTokenName}` as ActivityId;
          processedPools.add(activityId);

          results.push({
            activityId,
            usdValue: totalNonXrdDerivativeUsdValue.toString(),
            metadata: {
              tokenPair,
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
          });
        }

        // Add zero entries for pools with no positions
        for (const pool of Object.values(
          CaviarNineConstants.shapeLiquidityPools
        )) {
          const xTokenName = yield* tokenNameService(pool.token_x);
          const yTokenName = yield* tokenNameService(pool.token_y);
          const activityId = `c9_lp_${xTokenName}-${yTokenName}` as ActivityId;

          if (!processedPools.has(activityId)) {
            results.push({
              activityId,
              usdValue: "0",
            });
          }
        }

        return results;
      });
  })
);

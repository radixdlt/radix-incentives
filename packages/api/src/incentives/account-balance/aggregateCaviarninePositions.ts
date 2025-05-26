import { Effect, Layer } from "effect";
import type { AccountBalance } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import { GetUsdValueService } from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";

type C9XrdUsdcLp = {
  type: "c9_xrd_usdc_lp";
  xTokenResourceAddress: string;
  xTokenWithinPriceBounds: string;
  yTokenResourceAddress: string;
  yTokenWithinPriceBounds: string;
};

type AggregateCaviarninePositionsInput = {
  accountBalance: AccountBalance;
  timestamp: Date;
};

type AggregateCaviarninePositionsOutput = {
  timestamp: Date;
  address: string;
  activityId: string;
  usdValue: string;
  data: C9XrdUsdcLp;
};

export class AggregateCaviarninePositionsService extends Context.Tag(
  "AggregateCaviarninePositionsService"
)<
  AggregateCaviarninePositionsService,
  (
    input: AggregateCaviarninePositionsInput
  ) => Effect.Effect<
    AggregateCaviarninePositionsOutput[],
    never,
    GetUsdValueService
  >
>() {}

export const AggregateCaviarninePositionsLive = Layer.effect(
  AggregateCaviarninePositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    return (input) =>
      Effect.gen(function* () {
        const xrdUsdc = input.accountBalance.caviarninePositions.xrdUsdc[0];

        if (!xrdUsdc) {
          return [];
        }

        const { xToken, yToken } = xrdUsdc;

        const { totalXToken, totalYToken } =
          input.accountBalance.caviarninePositions.xrdUsdc.reduce(
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

        if (totalXToken.isZero() && totalYToken.isZero()) {
          return [];
        }

        const xTokenUSDValue = yield* getUsdValueService({
          amount: totalXToken,
          resourceAddress: xToken.resourceAddress,
          timestamp: input.timestamp,
        });

        const yTokenUSDValue = yield* getUsdValueService({
          amount: totalYToken,
          resourceAddress: yToken.resourceAddress,
          timestamp: input.timestamp,
        });

        return [
          {
            timestamp: input.timestamp,
            address: input.accountBalance.address,
            activityId: "provideLiquidityToDex",
            usdValue: xTokenUSDValue.plus(yTokenUSDValue).toString(),
            data: {
              type: "c9_xrd_usdc_lp",
              xTokenResourceAddress: xToken.resourceAddress,
              xTokenWithinPriceBounds: totalXToken.toString(),
              yTokenResourceAddress: yToken.resourceAddress,
              yTokenWithinPriceBounds: totalYToken.toString(),
            },
          },
        ];
      });
  })
);

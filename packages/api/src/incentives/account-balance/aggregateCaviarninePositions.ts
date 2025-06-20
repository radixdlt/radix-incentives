import { Effect, Layer } from "effect";
import type { AccountBalance } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type InvalidResourceAddressError,
  type PriceServiceApiError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";

type C9XrdUsdcLp = {
  type: "c9_xrd_usdc_lp";
  xTokenResourceAddress: string;
  xTokenWithinPriceBounds: string;
  xTokenOutsidePriceBounds: string;
  yTokenResourceAddress: string;
  yTokenWithinPriceBounds: string;
  yTokenOutsidePriceBounds: string;
};

type NoData = Record<string, never>;

export type AggregateCaviarninePositionsInput = {
  accountBalance: AccountBalance;
  timestamp: Date;
};

export type AggregateCaviarninePositionsOutput = {
  timestamp: Date;
  address: string;
  activityId: string;
  usdValue: BigNumber;
  data: C9XrdUsdcLp | NoData;
};

export class AggregateCaviarninePositionsService extends Context.Tag(
  "AggregateCaviarninePositionsService"
)<
  AggregateCaviarninePositionsService,
  (
    input: AggregateCaviarninePositionsInput
  ) => Effect.Effect<
    AggregateCaviarninePositionsOutput[],
    InvalidResourceAddressError | PriceServiceApiError,
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
          return [
            {
              timestamp: input.timestamp,
              address: input.accountBalance.address,
              activityId: "provideLiquidityToDex",
              usdValue: new BigNumber(0),
              data: {},
            },
          ];
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
            usdValue: yTokenUSDValue,
            data: {
              type: "c9_xrd_usdc_lp",
              xTokenResourceAddress: xToken.resourceAddress,
              xTokenWithinPriceBounds: totalXToken.toString(),
              xTokenOutsidePriceBounds: xToken.outsidePriceBounds.toString(),
              yTokenResourceAddress: yToken.resourceAddress,
              yTokenWithinPriceBounds: totalYToken.toString(),
              yTokenOutsidePriceBounds: yToken.outsidePriceBounds.toString(),
            },
          },
        ];
      });
  })
);

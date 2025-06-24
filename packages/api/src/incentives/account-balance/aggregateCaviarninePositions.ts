import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type InvalidResourceAddressError,
  type PriceServiceApiError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import type { AccountBalanceData } from "db/incentives";

export class UnknownCaviarnineTokenError {
  readonly _tag = "UnknownCaviarnineTokenError";
  constructor(readonly resourceAddress: string) {}
}

// Helper function to get token name from resource address
// TODO: Abstract this to service if this is the approach we want to take
// Maybe we can do this smarter
const getTokenName = (
  resourceAddress: string
): Effect.Effect<string, UnknownCaviarnineTokenError, never> => {
  switch (resourceAddress) {
    case Assets.Fungible.XRD:
      return Effect.succeed("XRD");
    case Assets.Fungible.xUSDC:
      return Effect.succeed("xUSDC");
    case Assets.Fungible.xUSDT:
      return Effect.succeed("xUSDT");
    case Assets.Fungible.xETH:
      return Effect.succeed("xETH");
    case Assets.Fungible.wxBTC:
      return Effect.succeed("wxBTC");
    default:
      return Effect.fail(new UnknownCaviarnineTokenError(resourceAddress));
  }
};

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
    | InvalidResourceAddressError
    | PriceServiceApiError
    | UnknownCaviarnineTokenError,
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
              activityId: "c9_lp_xrd-xusdc",
              usdValue: new BigNumber(0).toString(),
            } satisfies AccountBalanceData,
          ];
        }

        const { xToken, yToken } = xrdUsdc;

        // Determine which tokens are XRD and which are not
        const isXTokenXrd = xToken.resourceAddress === Assets.Fungible.XRD;
        const isYTokenXrd = yToken.resourceAddress === Assets.Fungible.XRD;

        // Get token names for the pair
        const xTokenName = yield* getTokenName(xToken.resourceAddress);
        const yTokenName = yield* getTokenName(yToken.resourceAddress);
        const tokenPair = `${xTokenName}_${yTokenName}`;

        const totals = input.accountBalance.caviarninePositions.xrdUsdc.reduce(
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

        return [
          {
            activityId: "c9_lp_xrd-xusdc",
            usdValue: totalNonXrdUsdValue.toString(),
            metadata: {
              tokenPair,
              xToken: {
                resourceAddress: xToken.resourceAddress,
                amount: totals.totalXToken.toString(),
                isXrd: isXTokenXrd,
              },
              yToken: {
                resourceAddress: yToken.resourceAddress,
                amount: totals.totalYToken.toString(),
                isXrd: isYTokenXrd,
              },
            },
          },
        ];
      });
  })
);

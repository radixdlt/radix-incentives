import { Effect, Layer } from "effect";
import type { AccountBalance } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type InvalidResourceAddressError,
  type PriceServiceApiError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";

export class UnknownDefiPlazaTokenError {
  readonly _tag = "UnknownDefiPlazaTokenError";
  constructor(readonly resourceAddress: string) {}
}

export class InvalidDefiPlazaPositionError {
  readonly _tag = "InvalidDefiPlazaPositionError";
  constructor(
    readonly lpResourceAddress: string,
    readonly reason: string
  ) {}
}

// Helper function to get token name from resource address
// TODO: Abstract this to service if this is the approach we want to take
// Maybe we can do this smarter
const getTokenName = (
  resourceAddress: string
): Effect.Effect<string, UnknownDefiPlazaTokenError, never> => {
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
      return Effect.fail(new UnknownDefiPlazaTokenError(resourceAddress));
  }
};

type DefiPlazaLpPosition = {
  type: "defiplaza_lp";
  lpResourceAddress: string;
  tokenPair: string; // "xUSDC_XRD", "xUSDT_XRD"
  nonXrdToken: {
    resourceAddress: string;
    amount: string;
  };
  xrdToken: {
    resourceAddress: string;
    amount: string;
  };
};

type NoData = Record<string, never>;

export type AggregateDefiPlazaPositionsInput = {
  accountBalance: AccountBalance;
  timestamp: Date;
};

export type AggregateDefiPlazaPositionsOutput = {
  timestamp: Date;
  address: string;
  activityId: string;
  usdValue: BigNumber;
  data: DefiPlazaLpPosition | NoData;
};

export class AggregateDefiPlazaPositionsService extends Context.Tag(
  "AggregateDefiPlazaPositionsService"
)<
  AggregateDefiPlazaPositionsService,
  (
    input: AggregateDefiPlazaPositionsInput
  ) => Effect.Effect<
    AggregateDefiPlazaPositionsOutput[],
    | InvalidResourceAddressError
    | PriceServiceApiError
    | UnknownDefiPlazaTokenError
    | InvalidDefiPlazaPositionError,
    GetUsdValueService
  >
>() {}

export const AggregateDefiPlazaPositionsLive = Layer.effect(
  AggregateDefiPlazaPositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    return (input) =>
      Effect.gen(function* () {
        const defiPlazaPositions =
          input.accountBalance.defiPlazaPositions.items;

        if (defiPlazaPositions.length === 0) {
          return [
            {
              timestamp: input.timestamp,
              address: input.accountBalance.address,
              activityId: "provideLiquidityToDex_defiplaza",
              usdValue: new BigNumber(0),
              data: {},
            },
          ];
        }

        const results: AggregateDefiPlazaPositionsOutput[] = [];

        for (const lpPosition of defiPlazaPositions) {
          // Find XRD and non-XRD parts
          const xrdPosition = lpPosition.position.find(
            (pos) => pos.resourceAddress === Assets.Fungible.XRD
          );
          const nonXrdPosition = lpPosition.position.find(
            (pos) => pos.resourceAddress !== Assets.Fungible.XRD
          );

          if (!xrdPosition || !nonXrdPosition) {
            // Throw error for invalid positions (not both XRD and non-XRD token)
            return yield* Effect.fail(
              new InvalidDefiPlazaPositionError(
                lpPosition.lpResourceAddress,
                `Position must contain both XRD and non-XRD token. Found: ${lpPosition.position.map((p) => p.resourceAddress).join(", ")}`
              )
            );
          }

          // Get token names for pair identification, can fail with UnknownDefiPlazaTokenError
          const nonXrdTokenName = yield* getTokenName(
            nonXrdPosition.resourceAddress
          );
          const xrdTokenName = yield* getTokenName(xrdPosition.resourceAddress);
          const tokenPair = `${nonXrdTokenName}_${xrdTokenName}`;

          // Only count non-XRD token value for provideLiquidityToDex activity
          const nonXrdUsdValue = yield* getUsdValueService({
            amount: new BigNumber(nonXrdPosition.amount),
            resourceAddress: nonXrdPosition.resourceAddress,
            timestamp: input.timestamp,
          });

          results.push({
            timestamp: input.timestamp,
            address: input.accountBalance.address,
            activityId: "provideLiquidityToDex",
            usdValue: nonXrdUsdValue,
            data: {
              type: "defiplaza_lp",
              lpResourceAddress: lpPosition.lpResourceAddress,
              tokenPair,
              nonXrdToken: {
                resourceAddress: nonXrdPosition.resourceAddress,
                amount: nonXrdPosition.amount.toString(),
              },
              xrdToken: {
                resourceAddress: xrdPosition.resourceAddress,
                amount: xrdPosition.amount.toString(),
              },
            },
          });
        }

        return results;
      });
  })
);

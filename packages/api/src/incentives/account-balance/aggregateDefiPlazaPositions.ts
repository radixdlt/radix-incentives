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

export type AggregateDefiPlazaPositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateDefiPlazaPositionsOutput = AccountBalanceData;

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
              activityId: "defiPlaza_lp_xrd-xusdc",
              usdValue: new BigNumber(0).toString(),
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
            activityId: "defiPlaza_lp_xrd-xusdc",
            usdValue: nonXrdUsdValue.toString(),
            metadata: {
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

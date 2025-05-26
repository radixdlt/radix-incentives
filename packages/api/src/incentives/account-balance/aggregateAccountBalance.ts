import { Effect, Layer } from "effect";
import type { AccountBalance } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import type { GetUsdValueService } from "../token-price/getUsdValue";
import { AggregateCaviarninePositionsService } from "./aggregateCaviarninePositions";

type AggregateAccountBalanceInput = {
  accountBalances: AccountBalance[];
  timestamp: Date;
};

type C9XrdUsdcLp = {
  type: "c9_xrd_usdc_lp";
  xTokenResourceAddress: string;
  xTokenWithinPriceBounds: string;
  yTokenResourceAddress: string;
  yTokenWithinPriceBounds: string;
};

export type AggregateAccountBalanceOutput = {
  timestamp: Date;
  address: string;
  activityId: string;
  usdValue: string;
  data: C9XrdUsdcLp;
};

export class AggregateAccountBalanceService extends Context.Tag(
  "AggregateAccountBalanceService"
)<
  AggregateAccountBalanceService,
  (
    input: AggregateAccountBalanceInput
  ) => Effect.Effect<AggregateAccountBalanceOutput[], never, GetUsdValueService>
>() {}

export const AggregateAccountBalanceLive = Layer.effect(
  AggregateAccountBalanceService,
  Effect.gen(function* () {
    const aggregateCaviarninePositionsService =
      yield* AggregateCaviarninePositionsService;
    return (input) =>
      Effect.gen(function* () {
        const result = yield* Effect.forEach(
          input.accountBalances,
          (accountBalance) => {
            return Effect.gen(function* () {
              const caviarninePositions =
                yield* aggregateCaviarninePositionsService({
                  accountBalance,
                  timestamp: input.timestamp,
                });

              return [...caviarninePositions];
            });
          }
        ).pipe(Effect.map((items) => items.flat()));

        return result;
      });
  })
);

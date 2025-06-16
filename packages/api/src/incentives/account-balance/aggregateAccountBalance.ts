import { Effect, Layer } from "effect";
import type { AccountBalance } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import type {
  GetUsdValueService,
  InvalidResourceAddressError,
  PriceServiceApiError,
} from "../token-price/getUsdValue";
import {
  type AggregateCaviarninePositionsOutput,
  AggregateCaviarninePositionsService,
} from "./aggregateCaviarninePositions";

import {
  type XrdBalanceOutput,
  XrdBalanceService,
} from "./aggregateXrdBalance";
import {
  type AggregateWeftFinancePositionsOutput,
  AggregateWeftFinancePositionsService,
} from "./aggregateWeftFinancePositions";

type AggregateAccountBalanceInput = {
  accountBalances: AccountBalance[];
  timestamp: Date;
};

export type AggregateAccountBalanceOutput =
  | AggregateCaviarninePositionsOutput
  | XrdBalanceOutput
  | AggregateWeftFinancePositionsOutput;

export type AggregateAccountBalanceServiceDependency =
  | AggregateCaviarninePositionsService
  | XrdBalanceService
  | GetUsdValueService
  | AggregateWeftFinancePositionsService;

export type AggregateAccountBalanceError =
  | InvalidResourceAddressError
  | PriceServiceApiError;

export class AggregateAccountBalanceService extends Context.Tag(
  "AggregateAccountBalanceService"
)<
  AggregateAccountBalanceService,
  (
    input: AggregateAccountBalanceInput
  ) => Effect.Effect<
    AggregateAccountBalanceOutput[],
    AggregateAccountBalanceError,
    AggregateAccountBalanceServiceDependency
  >
>() {}

export const AggregateAccountBalanceLive = Layer.effect(
  AggregateAccountBalanceService,
  Effect.gen(function* () {
    const aggregateCaviarninePositionsService =
      yield* AggregateCaviarninePositionsService;
    const xrdBalanceService = yield* XrdBalanceService;
    const aggregateWeftFinancePositionsService =
      yield* AggregateWeftFinancePositionsService;
    return (input) =>
      Effect.gen(function* () {
        const caviarninePositions = yield* Effect.forEach(
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

        const xrdBalanceResult = yield* Effect.forEach(
          input.accountBalances,
          (accountBalance) => {
            return Effect.gen(function* () {
              const xrdBalance = yield* xrdBalanceService({
                accountBalance,
                timestamp: input.timestamp,
              });
              return [...xrdBalance];
            });
          }
        ).pipe(Effect.map((items) => items.flat()));

        const lendingPositions = yield* Effect.forEach(
          input.accountBalances,
          (accountBalance) => {
            return Effect.gen(function* () {
              const weftFinancePositions =
                yield* aggregateWeftFinancePositionsService({
                  accountBalance,
                  timestamp: input.timestamp,
                });
              return [...weftFinancePositions];
            });
          }
        ).pipe(Effect.map((items) => items.flat()));

        yield* Effect.log("account balances aggregated");

        return [
          ...caviarninePositions,
          ...xrdBalanceResult,
          ...lendingPositions,
        ];
      });
  })
);

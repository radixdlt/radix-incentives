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
  type AggregateLendingPositionsOutput,
  AggregateLendingPositionsService,
} from "./aggregateLendingPositions";

type AggregateAccountBalanceInput = {
  accountBalances: AccountBalance[];
  timestamp: Date;
};

export type AggregateAccountBalanceOutput =
  | AggregateCaviarninePositionsOutput
  | XrdBalanceOutput
  | AggregateLendingPositionsOutput;

export type AggregateAccountBalanceServiceDependency =
  | AggregateCaviarninePositionsService
  | XrdBalanceService
  | GetUsdValueService
  | AggregateLendingPositionsService;

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
    const aggregateLendingPositionsService =
      yield* AggregateLendingPositionsService;
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
              const lendingPositions =
                yield* aggregateLendingPositionsService({
                  accountBalance,
                  timestamp: input.timestamp,
                });
              return [...lendingPositions];
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

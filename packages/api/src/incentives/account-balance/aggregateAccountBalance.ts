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
import {
  type AggregateRootFinancePositionsOutput,
  AggregateRootFinancePositionsService,
} from "./aggregateRootFinancePositions";
import {
  CombineActivityResultsService,
  type CombinedActivityResult,
} from "./combineActivityResults";

type AggregateAccountBalanceInput = {
  accountBalances: AccountBalance[];
  timestamp: Date;
};

export type AggregateAccountBalanceOutput =
  | AggregateCaviarninePositionsOutput
  | XrdBalanceOutput
  | AggregateWeftFinancePositionsOutput
  | AggregateRootFinancePositionsOutput
  | CombinedActivityResult;

export type AggregateAccountBalanceServiceDependency =
  | AggregateCaviarninePositionsService
  | XrdBalanceService
  | GetUsdValueService
  | AggregateWeftFinancePositionsService
  | AggregateRootFinancePositionsService
  | CombineActivityResultsService;

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
    const aggregateRootFinancePositionsService =
      yield* AggregateRootFinancePositionsService;
    const combineActivityResultsService = yield* CombineActivityResultsService;
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

        const weftFinancePositions = yield* Effect.forEach(
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

        const rootFinancePositions = yield* Effect.forEach(
          input.accountBalances,
          (accountBalance) => {
            return Effect.gen(function* () {
              const rootFinancePositions =
                yield* aggregateRootFinancePositionsService({
                  accountBalance,
                  timestamp: input.timestamp,
                });
              return [...rootFinancePositions];
            });
          }
        ).pipe(Effect.map((items) => items.flat()));

        // Combine all results
        const allResults = [
          ...caviarninePositions,
          ...xrdBalanceResult,
          ...weftFinancePositions,
          ...rootFinancePositions,
        ];

        // Use activity-specific combination logic
        const combinedResults = yield* combineActivityResultsService({
          results: allResults,
        });

        yield* Effect.log("account balances aggregated");

        return combinedResults;
      });
  })
);

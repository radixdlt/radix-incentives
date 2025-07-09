import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import type { GetUsdValueServiceError } from "../token-price/getUsdValue";
import { AggregateCaviarninePositionsService } from "./aggregateCaviarninePositions";
import { AggregateOciswapPositionsService } from "./aggregateOciswapPositions";

import { XrdBalanceService } from "./aggregateXrdBalance";
import { AggregateWeftFinancePositionsService } from "./aggregateWeftFinancePositions";
import { AggregateRootFinancePositionsService } from "./aggregateRootFinancePositions";
import {
  AggregateDefiPlazaPositionsService,
  type InvalidDefiPlazaPositionError,
} from "./aggregateDefiPlazaPositions";
import { AggregateSurgePositionsService } from "./aggregateSurgePositions";
import type { UnknownTokenError } from "../../common/token-name/getTokenName";
import type { AccountBalance } from "db/incentives";

type AggregateAccountBalanceInput = {
  accountBalances: AccountBalanceFromSnapshot[];
  timestamp: Date;
};

export type AggregateAccountBalanceOutput = AccountBalance;

export type AggregateAccountBalanceError =
  | GetUsdValueServiceError
  | UnknownTokenError
  | InvalidDefiPlazaPositionError;

export class AggregateAccountBalanceService extends Context.Tag(
  "AggregateAccountBalanceService"
)<
  AggregateAccountBalanceService,
  (
    input: AggregateAccountBalanceInput
  ) => Effect.Effect<AccountBalance[], AggregateAccountBalanceError>
>() {}

export const AggregateAccountBalanceLive = Layer.effect(
  AggregateAccountBalanceService,
  Effect.gen(function* () {
    const aggregateCaviarninePositionsService =
      yield* AggregateCaviarninePositionsService;
    const aggregateOciswapPositionsService =
      yield* AggregateOciswapPositionsService;
    const xrdBalanceService = yield* XrdBalanceService;
    const aggregateWeftFinancePositionsService =
      yield* AggregateWeftFinancePositionsService;
    const aggregateRootFinancePositionsService =
      yield* AggregateRootFinancePositionsService;
    const aggregateDefiPlazaPositionsService =
      yield* AggregateDefiPlazaPositionsService;
    const aggregateSurgePositionsService = yield* AggregateSurgePositionsService;

    return (input) =>
      Effect.gen(function* () {
        return yield* Effect.forEach(
          input.accountBalances,
          (accountBalance) => {
            return Effect.gen(function* () {
              const caviarninePositions =
                yield* aggregateCaviarninePositionsService({
                  accountBalance,
                  timestamp: input.timestamp,
                });
              const ociswapPositions = yield* aggregateOciswapPositionsService({
                accountBalance,
                timestamp: input.timestamp,
              });
              const xrdBalance = yield* xrdBalanceService({
                accountBalance,
                timestamp: input.timestamp,
              });
              const weftFinancePositions =
                yield* aggregateWeftFinancePositionsService({
                  accountBalance,
                  timestamp: input.timestamp,
                });
              const rootFinancePositions =
                yield* aggregateRootFinancePositionsService({
                  accountBalance,
                  timestamp: input.timestamp,
                });
              const defiPlazaPositions =
                yield* aggregateDefiPlazaPositionsService({
                  accountBalance,
                  timestamp: input.timestamp,
                });
              const surgePositions = yield* aggregateSurgePositionsService.aggregateSurgePositions({
                accountBalance,
                timestamp: input.timestamp,
              });

              return {
                timestamp: input.timestamp,
                accountAddress: accountBalance.address,
                data: [
                  ...caviarninePositions,
                  ...ociswapPositions,
                  ...xrdBalance,
                  ...weftFinancePositions,
                  ...rootFinancePositions,
                  ...defiPlazaPositions,
                  ...surgePositions,
                ],
              };
            });
          }
        );
      });
  })
);

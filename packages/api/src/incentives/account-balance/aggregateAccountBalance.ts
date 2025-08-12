import type { AccountBalance } from 'db/incentives';
import { Effect } from 'effect';
import { AggregateCaviarninePositionsService } from './aggregateCaviarninePositions';
import { AggregateDefiPlazaPositionsService } from './aggregateDefiPlazaPositions';
import { AggregateOciswapPositionsService } from './aggregateOciswapPositions';
import { AggregateRootFinancePositionsService } from './aggregateRootFinancePositions';
import { AggregateSurgePositionsService } from './aggregateSurgePositions';
import { AggregateWeftFinancePositionsService } from './aggregateWeftFinancePositions';
import { XrdBalanceService } from './aggregateXrdBalance';
import type { AccountBalance as AccountBalanceFromSnapshot } from './getAccountBalancesAtStateVersion';

type AggregateAccountBalanceInput = {
  accountBalances: AccountBalanceFromSnapshot[];
  timestamp: Date;
};

export type AggregateAccountBalanceOutput = AccountBalance;

export class AggregateAccountBalanceService extends Effect.Service<AggregateAccountBalanceService>()(
  'AggregateAccountBalanceService',
  {
    effect: Effect.gen(function* () {
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
      const aggregateSurgePositionsService =
        yield* AggregateSurgePositionsService;
      return Effect.fn('aggregateAccountBalance')(function* (
        input: AggregateAccountBalanceInput,
      ) {
        return yield* Effect.forEach(
          input.accountBalances,
          Effect.fn('aggregateAccountBalanceItem')(function* (accountBalance) {
            const caviarninePositions =
              yield* aggregateCaviarninePositionsService({
                accountBalance,
                timestamp: input.timestamp,
              });
            const ociswapPositions = yield* aggregateOciswapPositionsService({
              accountBalance: accountBalance.ociswapPositions,
              timestamp: input.timestamp,
            });
            const defiPlazaPositions =
              yield* aggregateDefiPlazaPositionsService({
                accountBalance: accountBalance.defiPlazaPositions,
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

            const surgePositions =
              yield* aggregateSurgePositionsService.aggregateSurgePositions({
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
          }),
          { concurrency: 1000 },
        );
      });
    }),
  },
) {}

export const AggregateAccountBalanceLive =
  AggregateAccountBalanceService.Default;

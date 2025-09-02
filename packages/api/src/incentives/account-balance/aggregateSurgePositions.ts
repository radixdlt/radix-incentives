import { type AccountBalanceData, ActivityId } from 'data';
import { Config, Effect } from 'effect';
import { GetUsdValueService } from '../token-price/getUsdValue';
import type { AccountBalance as AccountBalanceFromSnapshot } from './getAccountBalancesAtStateVersion';

export type AggregateSurgePositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateSurgePositionsOutput = AccountBalanceData;

export class AggregateSurgePositionsService extends Effect.Service<AggregateSurgePositionsService>()(
  'AggregateSurgePositionsService',
  {
    dependencies: [GetUsdValueService.Default],
    effect: Effect.gen(function* () {
      const STORE_METADATA = yield* Config.boolean('DEBUG_STORE_METADATA').pipe(
        Config.withDefault(false),
      );
      const getUsdValueService = yield* GetUsdValueService;

      return {
        aggregateSurgePositions: Effect.fn(
          (input: AggregateSurgePositionsInput) =>
            Effect.gen(function* () {
              const accountBalance = input.accountBalance;
              const activityId = ActivityId.su_lp_sta_susd;

              if (
                !accountBalance.surgePositions.liquidityPosition.amount.isZero()
              ) {
                const usdValue = yield* getUsdValueService({
                  amount:
                    accountBalance.surgePositions.liquidityPosition.amount,
                  resourceAddress:
                    accountBalance.surgePositions.liquidityPosition
                      .resourceAddress,
                  timestamp: input.timestamp,
                });

                return [
                  {
                    activityId,
                    usdValue: usdValue.toString(),
                    metadata: STORE_METADATA
                      ? {
                          [accountBalance.surgePositions.liquidityPosition
                            .resourceAddress]:
                            accountBalance.surgePositions.liquidityPosition.amount.toString(),
                        }
                      : undefined,
                  } satisfies AccountBalanceData,
                ];
              }

              // Return zero entry if no liquidity position
              return [
                {
                  activityId,
                  usdValue: '0',
                } satisfies AccountBalanceData,
              ];
            }),
        ),
      };
    }),
  },
) {}

export const AggregateSurgePositionsLive =
  AggregateSurgePositionsService.Default;

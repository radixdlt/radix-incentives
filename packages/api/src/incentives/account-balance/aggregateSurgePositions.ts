import { Effect } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import type { AccountBalanceData } from "db/incentives";

export type AggregateSurgePositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateSurgePositionsOutput = AccountBalanceData;

export class AggregateSurgePositionsService extends Effect.Service<AggregateSurgePositionsService>()(
  "AggregateSurgePositionsService",
  {
    effect: Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;

      return {
        aggregateSurgePositions: (
          input: AggregateSurgePositionsInput
        ): Effect.Effect<
          AggregateSurgePositionsOutput[],
          GetUsdValueServiceError
        > =>
          Effect.gen(function* () {
            const accountBalance = input.accountBalance;
            const activityId = "surge_lp_xusdc";

            if (
              !accountBalance.surgePositions.liquidityPosition.amount.isZero()
            ) {
              const usdValue = yield* getUsdValueService({
                amount: accountBalance.surgePositions.liquidityPosition.amount,
                resourceAddress:
                  accountBalance.surgePositions.liquidityPosition
                    .resourceAddress,
                timestamp: input.timestamp,
              });

              return [
                {
                  activityId,
                  usdValue: usdValue.toString(),
                  metadata: {
                    [accountBalance.surgePositions.liquidityPosition
                      .resourceAddress]:
                      accountBalance.surgePositions.liquidityPosition.amount.toString(),
                  },
                } satisfies AccountBalanceData,
              ];
            }

            // Return zero entry if no liquidity position
            return [
              {
                activityId,
                usdValue: new BigNumber(0).toString(),
              } satisfies AccountBalanceData,
            ];
          }),
      };
    }),
  }
) {}

export const AggregateSurgePositionsLive =
  AggregateSurgePositionsService.Default;

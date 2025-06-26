import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import type { AccountBalanceData } from "db/incentives";

export type AggregateRootFinancePositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateRootFinancePositionsOutput = AccountBalanceData;

export class AggregateRootFinancePositionsService extends Context.Tag(
  "AggregateRootFinancePositionsService"
)<
  AggregateRootFinancePositionsService,
  (
    input: AggregateRootFinancePositionsInput
  ) => Effect.Effect<
    AggregateRootFinancePositionsOutput[],
    GetUsdValueServiceError,
    GetUsdValueService
  >
>() {}

export const AggregateRootFinancePositionsLive = Layer.effect(
  AggregateRootFinancePositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    return (input) =>
      Effect.gen(function* () {
        const accountBalance = input.accountBalance;

        if (accountBalance.rootFinancePositions.length === 0) {
          return [
            {
              activityId: "root_lend_xusdc",
              usdValue: new BigNumber(0).toString(),
            } satisfies AccountBalanceData,
          ];
        }

        // Aggregate collateral amounts across all Root Finance positions
        const { xUSDC } = accountBalance.rootFinancePositions.reduce(
          (acc, position) => {
            // Process collaterals (the lent/deposited assets)
            for (const [resourceAddress, amount] of Object.entries(
              position.collaterals
            )) {
              if (
                resourceAddress === Assets.Fungible.xUSDC &&
                amount != null &&
                amount !== ""
              ) {
                try {
                  const amountBN = new BigNumber(amount);
                  if (amountBN.isFinite() && !amountBN.isNaN()) {
                    acc.xUSDC = acc.xUSDC.plus(amountBN);
                  }
                } catch (error) {
                  // Skip invalid amounts silently or log if needed
                  console.warn(
                    `Invalid Root Finance collateral amount: ${amount}`
                  );
                }
              }
            }
            return acc;
          },
          { xUSDC: new BigNumber(0) }
        );

        const xUSDCValue = yield* getUsdValueService({
          amount: xUSDC,
          resourceAddress: Assets.Fungible.xUSDC,
          timestamp: input.timestamp,
        });

        return [
          {
            activityId: "root_lend_xusdc",
            usdValue: xUSDCValue.toString(),
            metadata: {
              xUSDC: xUSDC.toString(),
            },
          },
        ];
      });
  })
);

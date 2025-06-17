import { Effect, Layer } from "effect";
import type { AccountBalance } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type InvalidResourceAddressError,
  type PriceServiceApiError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";

type RootLendingData = {
  protocol: "root";
  xUSDC?: string;
};

export type AggregateRootFinancePositionsInput = {
  accountBalance: AccountBalance;
  timestamp: Date;
};

export type AggregateRootFinancePositionsOutput = {
  timestamp: Date;
  address: string;
  activityId: string;
  usdValue: BigNumber;
  data: RootLendingData;
};

export class AggregateRootFinancePositionsService extends Context.Tag(
  "AggregateRootFinancePositionsService"
)<
  AggregateRootFinancePositionsService,
  (
    input: AggregateRootFinancePositionsInput
  ) => Effect.Effect<
    AggregateRootFinancePositionsOutput[],
    InvalidResourceAddressError | PriceServiceApiError,
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
              timestamp: input.timestamp,
              address: input.accountBalance.address,
              activityId: "lending",
              usdValue: new BigNumber(0),
              data: { protocol: "root" } as RootLendingData,
            },
          ];
        }

        // Aggregate collateral amounts across all Root Finance positions
        const { xUSDC } = accountBalance.rootFinancePositions.reduce(
          (acc, position) => {
            // Process collaterals (the lent/deposited assets)
            for (const [resourceAddress, amount] of Object.entries(
              position.collaterals
            )) {
              if (resourceAddress === Assets.Fungible.xUSDC && amount != null && amount !== "") {
                try {
                  const amountBN = new BigNumber(amount);
                  if (amountBN.isFinite() && !amountBN.isNaN()) {
                    acc.xUSDC = acc.xUSDC.plus(amountBN);
                  }
                } catch (error) {
                  // Skip invalid amounts silently or log if needed
                  console.warn(`Invalid Root Finance collateral amount: ${amount}`);
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
            timestamp: input.timestamp,
            address: input.accountBalance.address,
            activityId: "lending",
            usdValue: xUSDCValue,
            data: { protocol: "root", xUSDC: xUSDC.toString() } as RootLendingData,
          },
        ];
      });
  })
);
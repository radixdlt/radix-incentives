import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type InvalidResourceAddressError,
  type PriceServiceApiError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import type { AccountBalanceData } from "db/incentives";

export type AggregateWeftFinancePositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateWeftFinancePositionsOutput = AccountBalanceData;

export class AggregateWeftFinancePositionsService extends Context.Tag(
  "AggregateWeftFinancePositionsService"
)<
  AggregateWeftFinancePositionsService,
  (
    input: AggregateWeftFinancePositionsInput
  ) => Effect.Effect<
    AggregateWeftFinancePositionsOutput[],
    InvalidResourceAddressError | PriceServiceApiError,
    GetUsdValueService
  >
>() {}

export const AggregateWeftFinancePositionsLive = Layer.effect(
  AggregateWeftFinancePositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    return (input) =>
      Effect.gen(function* () {
        const accountBalance = input.accountBalance;

        if (accountBalance.weftFinancePositions.length === 0) {
          return [
            {
              activityId: "weft_lend_xusdc",
              usdValue: new BigNumber(0).toString(),
            } satisfies AccountBalanceData,
          ];
        }

        const { xUSDC } = accountBalance.weftFinancePositions.reduce(
          (acc, item) => {
            if (item.unwrappedAsset.resourceAddress === Assets.Fungible.xUSDC) {
              acc.xUSDC = acc.xUSDC.plus(item.unwrappedAsset.amount);
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
            activityId: "weft_lend_xusdc",
            usdValue: xUSDCValue.toString(),
            metadata: {
              xUSDC: xUSDC.toString(),
            },
          },
        ];
      });
  })
);

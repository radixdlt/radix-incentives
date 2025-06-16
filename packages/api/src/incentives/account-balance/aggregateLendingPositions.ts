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

export type AggregateLendingPositionsInput = {
  accountBalance: AccountBalance;
  timestamp: Date;
};

export type AggregateLendingPositionsOutput = {
  timestamp: Date;
  address: string;
  activityId: string;
  usdValue: BigNumber;
  data: Partial<{
    weftxUSDC: string;
  }>;
};

export class AggregateLendingPositionsService extends Context.Tag(
  "AggregateLendingPositionsService"
)<
  AggregateLendingPositionsService,
  (
    input: AggregateLendingPositionsInput
  ) => Effect.Effect<
    AggregateLendingPositionsOutput[],
    InvalidResourceAddressError | PriceServiceApiError,
    GetUsdValueService
  >
>() {}

export const AggregateLendingPositionsLive = Layer.effect(
  AggregateLendingPositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    return (input) =>
      Effect.gen(function* () {
        const accountBalance = input.accountBalance;

        if (
          accountBalance.weftFinancePositions.length === 0 &&
          accountBalance.rootFinancePositions.length === 0
        ) {
          return [
            {
              timestamp: input.timestamp,
              address: input.accountBalance.address,
              activityId: "lending",
              usdValue: new BigNumber(0),
              data: {},
            },
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
            timestamp: input.timestamp,
            address: input.accountBalance.address,
            activityId: "lending",
            usdValue: xUSDCValue,
            data: {
              weftxUSDC: xUSDC.toString(),
            },
          },
        ];
      });
  })
);

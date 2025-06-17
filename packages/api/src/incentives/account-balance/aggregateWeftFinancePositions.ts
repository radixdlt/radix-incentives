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

type WeftLendingData = {
  protocol: "weft";
  xUSDC?: string;
};

export type AggregateWeftFinancePositionsInput = {
  accountBalance: AccountBalance;
  timestamp: Date;
};

export type AggregateWeftFinancePositionsOutput = {
  timestamp: Date;
  address: string;
  activityId: string;
  usdValue: BigNumber;
  data: WeftLendingData;
};

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
              timestamp: input.timestamp,
              address: input.accountBalance.address,
              activityId: "lending",
              usdValue: new BigNumber(0),
              data: { protocol: "weft" } as WeftLendingData,
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
            data: { protocol: "weft", xUSDC: xUSDC.toString() } as WeftLendingData,
          },
        ];
      });
  })
);

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
    GetUsdValueServiceError
  >
>() {}

export const AggregateWeftFinancePositionsLive = Layer.effect(
  AggregateWeftFinancePositionsService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    return (input) =>
      Effect.gen(function* () {
        const accountBalance = input.accountBalance;

        // Define supported assets and their activity IDs
        // Note: LSULP is excluded as it's only used as collateral on Weft, not for earning interest
        const supportedAssets = {
          // Stables
          [Assets.Fungible.xUSDC]: "weft_lend_xusdc",
          [Assets.Fungible.xUSDT]: "weft_lend_xusdt",
          // Blue chips
          [Assets.Fungible.wxBTC]: "weft_lend_xwbtc",
          [Assets.Fungible.xETH]: "weft_lend_xeth",
          // Native assets (XRD only, LSULP excluded)
          [Assets.Fungible.XRD]: "weft_lend_xrd",
        } as const;

        if (accountBalance.weftFinancePositions.length === 0) {
          // Return zero entries for all supported assets
          return Object.entries(supportedAssets).map(
            ([_, activityId]) =>
              ({
                activityId,
                usdValue: new BigNumber(0).toString(),
              }) satisfies AccountBalanceData
          );
        }

        // Aggregate amounts across all Weft Finance positions
        const aggregatedAmounts = accountBalance.weftFinancePositions.reduce(
          (acc, item) => {
            const resourceAddress = item.unwrappedAsset.resourceAddress;

            if (resourceAddress in supportedAssets) {
              if (!acc[resourceAddress]) {
                acc[resourceAddress] = new BigNumber(0);
              }
              acc[resourceAddress] = acc[resourceAddress].plus(
                item.unwrappedAsset.amount
              );
            }
            return acc;
          },
          {} as Record<string, BigNumber>
        );

        // Calculate USD values for each asset
        const results: AccountBalanceData[] = [];

        for (const [resourceAddress, activityId] of Object.entries(
          supportedAssets
        )) {
          const amount = aggregatedAmounts[resourceAddress] ?? new BigNumber(0);

          const usdValue = yield* getUsdValueService({
            amount,
            resourceAddress,
            timestamp: input.timestamp,
          });

          results.push({
            activityId,
            usdValue: usdValue.toString(),
            metadata: {
              [resourceAddress]: amount.toString(),
            },
          });
        }

        return results;
      });
  })
);

import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import { CaviarNineConstants } from "../../common/dapps/caviarnine/constants";
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

        // Define supported assets and their activity IDs
        const supportedAssets = {
          // Stables
          [Assets.Fungible.xUSDC]: "root_lend_xusdc",
          [Assets.Fungible.xUSDT]: "root_lend_xusdt",
          // Blue chips
          [Assets.Fungible.wxBTC]: "root_lend_xwbtc",
          [Assets.Fungible.xETH]: "root_lend_xeth",
          // Native assets
          [Assets.Fungible.XRD]: "root_lend_xrd",
          [CaviarNineConstants.LSULP.resourceAddress]: "root_lend_lsulp",
        } as const;

        if (accountBalance.rootFinancePositions.length === 0) {
          // Return zero entries for all supported assets
          return Object.entries(supportedAssets).map(([_, activityId]) => ({
            activityId,
            usdValue: new BigNumber(0).toString(),
          } satisfies AccountBalanceData));
        }

        // Aggregate collateral amounts across all Root Finance positions
        const aggregatedAmounts = accountBalance.rootFinancePositions.reduce(
          (acc, position) => {
            // Process collaterals (the lent/deposited assets)
            for (const [resourceAddress, amount] of Object.entries(
              position.collaterals
            )) {
              if (
                resourceAddress in supportedAssets &&
                amount != null &&
                amount !== ""
              ) {
                try {
                  const amountBN = new BigNumber(amount);
                  if (amountBN.isFinite() && !amountBN.isNaN()) {
                    if (!acc[resourceAddress]) {
                      acc[resourceAddress] = new BigNumber(0);
                    }
                    acc[resourceAddress] = acc[resourceAddress].plus(amountBN);
                  }
                } catch (error) {
                  console.warn(
                    `Invalid Root Finance collateral amount: ${amount} for ${resourceAddress}`
                  );
                }
              }
            }
            return acc;
          },
          {} as Record<string, BigNumber>
        );

        // Calculate USD values for each asset
        const results: AccountBalanceData[] = [];
        
        for (const [resourceAddress, activityId] of Object.entries(supportedAssets)) {
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

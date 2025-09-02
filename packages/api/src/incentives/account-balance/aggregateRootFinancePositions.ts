import { BigNumber } from 'bignumber.js';
import {
  type AccountBalanceData,
  ActivityId,
  Assets,
  DappConstants,
} from 'data';
import { Config, Effect } from 'effect';
import { GetUsdValueService } from '../token-price/getUsdValue';
import type { AccountBalance as AccountBalanceFromSnapshot } from './getAccountBalancesAtStateVersion';

const CaviarNineConstants = DappConstants.CaviarNine.constants;

export type AggregateRootFinancePositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateRootFinancePositionsOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof AggregateRootFinancePositionsService)['Service']>>
>;

export class AggregateRootFinancePositionsService extends Effect.Service<AggregateRootFinancePositionsService>()(
  'AggregateRootFinancePositionsService',
  {
    dependencies: [GetUsdValueService.Default],
    effect: Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;
      const STORE_METADATA = yield* Config.boolean('DEBUG_STORE_METADATA').pipe(
        Config.withDefault(false),
      );
      return Effect.fn(function* (input: AggregateRootFinancePositionsInput) {
        const accountBalance = input.accountBalance;

        // Define supported assets and their activity IDs
        const supportedAssets = {
          // Stables
          [Assets.Fungible.xUSDC]: ActivityId.ro_le_sta_xusdc,
          [Assets.Fungible.xUSDT]: ActivityId.ro_le_sta_xusdt,
          // Blue chips
          [Assets.Fungible.wxBTC]: ActivityId.ro_le_blu_xwbtc,
          [Assets.Fungible.xETH]: ActivityId.ro_le_blu_xeth,
          // Native assets
          [Assets.Fungible.XRD]: ActivityId.ro_le_der_xrd,
          [CaviarNineConstants.LSULP.resourceAddress]:
            ActivityId.ro_le_der_lsulp,
        } as const;

        if (accountBalance.rootFinancePositions.length === 0) {
          // Return zero entries for all supported assets
          return Object.entries(supportedAssets).map(
            ([_, activityId]) =>
              ({
                activityId,
                usdValue: new BigNumber(0).toString(),
              }) satisfies AccountBalanceData,
          );
        }

        // Aggregate collateral amounts across all Root Finance positions
        const aggregatedAmounts = accountBalance.rootFinancePositions.reduce(
          (acc, position) => {
            // Process collaterals (the lent/deposited assets)
            for (const [resourceAddress, amount] of Object.entries(
              position.collaterals,
            )) {
              if (
                resourceAddress in supportedAssets &&
                amount != null &&
                amount !== ''
              ) {
                try {
                  const amountBN = new BigNumber(amount);
                  if (amountBN.isFinite() && !amountBN.isNaN()) {
                    if (!acc[resourceAddress]) {
                      acc[resourceAddress] = new BigNumber(0);
                    }
                    acc[resourceAddress] = acc[resourceAddress].plus(amountBN);
                  }
                } catch (_error) {
                  console.warn(
                    `Invalid Root Finance collateral amount: ${amount} for ${resourceAddress}`,
                  );
                }
              }
            }
            return acc;
          },
          {} as Record<string, BigNumber>,
        );

        // Calculate USD values for each asset
        const results: AccountBalanceData[] = [];

        for (const [resourceAddress, activityId] of Object.entries(
          supportedAssets,
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
            metadata: STORE_METADATA
              ? {
                  [resourceAddress]: amount.toString(),
                }
              : undefined,
          });
        }

        return results;
      });
    }),
  },
) {}

export const AggregateRootFinancePositionsServiceLive =
  AggregateRootFinancePositionsService.Default;

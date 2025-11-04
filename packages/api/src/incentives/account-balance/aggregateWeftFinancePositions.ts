import { BigNumber } from 'bignumber.js';
import { type AccountBalanceData, ActivityId, Assets } from 'data';
import { Config, Effect } from 'effect';
import { GetUsdValueService } from '../token-price/getUsdValue';
import type { AccountBalance as AccountBalanceFromSnapshot } from './getAccountBalancesAtStateVersion';

export type AggregateWeftFinancePositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateWeftFinancePositionsOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof AggregateWeftFinancePositionsService)['Service']>>
>;

export class AggregateWeftFinancePositionsService extends Effect.Service<AggregateWeftFinancePositionsService>()(
  'AggregateWeftFinancePositionsService',
  {
    dependencies: [GetUsdValueService.Default],
    effect: Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;
      const STORE_METADATA = yield* Config.boolean('DEBUG_STORE_METADATA').pipe(
        Config.withDefault(false),
      );
      return Effect.fn(function* (input: AggregateWeftFinancePositionsInput) {
        const accountBalance = input.accountBalance;

        // Define supported assets and their activity IDs
        // Note: LSULP is excluded as it's only used as collateral on Weft, not for earning interest
        const supportedAssets = {
          // Stables
          [Assets.Fungible.xUSDC]: ActivityId.we_le_sta_xusdc,
          [Assets.Fungible.xUSDT]: ActivityId.we_le_sta_xusdt,
          [Assets.Fungible.hUSDC]: ActivityId.we_le_sta_husdc,
          [Assets.Fungible.hUSDT]: ActivityId.we_le_sta_husdt,
          // Blue chips
          [Assets.Fungible.wxBTC]: ActivityId.we_le_blu_xwbtc,
          [Assets.Fungible.xETH]: ActivityId.we_le_blu_xeth,
          [Assets.Fungible.hwBTC]: ActivityId.we_le_blu_hwbtc,
          [Assets.Fungible.hETH]: ActivityId.we_le_blu_heth,
          [Assets.Fungible.hSOL]: ActivityId.we_le_blu_hsol,
          // XRD derivatives
          [Assets.Fungible.XRD]: ActivityId.we_le_der_xrd,
          [Assets.Fungible.LSULP]: ActivityId.we_le_der_lsulp,
        } as const;

        if (accountBalance.weftFinancePositions.lending.length === 0) {
          // Return zero entries for all supported assets
          return Object.entries(supportedAssets).map(
            ([_, activityId]) =>
              ({
                activityId,
                usdValue: new BigNumber(0).toString(),
              }) satisfies AccountBalanceData,
          );
        }

        // Aggregate amounts across all Weft Finance positions
        const aggregatedAmounts =
          accountBalance.weftFinancePositions.lending.reduce(
            (acc, item) => {
              const resourceAddress = item.unwrappedAsset.resourceAddress;

              if (resourceAddress in supportedAssets) {
                if (!acc[resourceAddress]) {
                  acc[resourceAddress] = new BigNumber(0);
                }
                acc[resourceAddress] = acc[resourceAddress].plus(
                  item.unwrappedAsset.amount,
                );
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

          // Skip price fetching for zero balances
          let usdValue: BigNumber;
          if (amount.isZero()) {
            usdValue = new BigNumber(0);
          } else {
            usdValue = yield* getUsdValueService({
              amount,
              resourceAddress,
              timestamp: input.timestamp,
            });
          }

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

export const AggregateWeftFinancePositionsServiceLive =
  AggregateWeftFinancePositionsService.Default;

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

const FluxConstants = DappConstants.Flux.constants;

export type AggregateFluxPositionsInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type AggregateFluxPositionsOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof AggregateFluxPositionsService)['Service']>>
>;

export class AggregateFluxPositionsService extends Effect.Service<AggregateFluxPositionsService>()(
  'AggregateFluxPositionsService',
  {
    dependencies: [GetUsdValueService.Default],
    effect: Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;
      const STORE_METADATA = yield* Config.boolean('DEBUG_STORE_METADATA').pipe(
        Config.withDefault(false),
      );
      return Effect.fn(function* (input: AggregateFluxPositionsInput) {
        const accountBalance = input.accountBalance;

        // Initialize aggregated amounts
        let totalFusdBorrowed = new BigNumber(0);
        let xrdReservoirXrd = new BigNumber(0);
        let xrdReservoirFusd = new BigNumber(0);
        let lsulpReservoirLsulp = new BigNumber(0);
        let lsulpReservoirFusd = new BigNumber(0);

        // Aggregate CDP positions - only track fUSD debt
        if (!accountBalance.fluxCdpPositions?.cdpPositions) {
          return [];
        }

        for (const cdp of accountBalance.fluxCdpPositions.cdpPositions) {
          const debt = new BigNumber(cdp.realDebt);
          if (!debt.isFinite() || debt.isNaN()) continue;

          totalFusdBorrowed = totalFusdBorrowed.plus(debt);
        }

        // Aggregate Reservoir positions
        if (!accountBalance.fluxReservoirPositions?.reservoirPositions) {
          return [];
        }

        for (const reservoir of accountBalance.fluxReservoirPositions
          .reservoirPositions) {
          const collateralValue = new BigNumber(
            reservoir.userPoolTokenValue.collateral,
          );
          const fusdValue = new BigNumber(reservoir.userPoolTokenValue.fusd);

          const isXrdReservoir =
            reservoir.collateralAddress ===
            FluxConstants.collaterals.xrd.collateralAddress;
          const isLsulpReservoir =
            reservoir.collateralAddress ===
            FluxConstants.collaterals.lsulp.collateralAddress;

          if (collateralValue.isFinite() && !collateralValue.isNaN()) {
            if (isXrdReservoir) {
              xrdReservoirXrd = xrdReservoirXrd.plus(collateralValue);
            } else if (isLsulpReservoir) {
              lsulpReservoirLsulp = lsulpReservoirLsulp.plus(collateralValue);
            }
          }

          if (fusdValue.isFinite() && !fusdValue.isNaN()) {
            if (isXrdReservoir) {
              xrdReservoirFusd = xrdReservoirFusd.plus(fusdValue);
            } else if (isLsulpReservoir) {
              lsulpReservoirFusd = lsulpReservoirFusd.plus(fusdValue);
            }
          }
        }

        // Calculate USD values for each activity
        const results: AccountBalanceData[] = [];

        // 1. fl_le_sta_fusd - Total fUSD borrowed
        const fusdBorrowedUsd = yield* getUsdValueService({
          amount: totalFusdBorrowed,
          resourceAddress: Assets.Fungible.fUSD,
          timestamp: input.timestamp,
        });
        results.push({
          activityId: ActivityId.fl_le_sta_fusd,
          usdValue: fusdBorrowedUsd.toString(),
          metadata: STORE_METADATA
            ? {
                [Assets.Fungible.fUSD]: totalFusdBorrowed.toString(),
              }
            : undefined,
        });

        // 2. fl_lp_sta_xrdfusd - FUSD in XRD reservoir
        const xrdReservoirFusdUsd = yield* getUsdValueService({
          amount: xrdReservoirFusd,
          resourceAddress: Assets.Fungible.fUSD,
          timestamp: input.timestamp,
        });
        results.push({
          activityId: ActivityId.fl_lp_sta_xrdfusd,
          usdValue: xrdReservoirFusdUsd.toString(),
          metadata: STORE_METADATA
            ? {
                [Assets.Fungible.fUSD]: xrdReservoirFusd.toString(),
              }
            : undefined,
        });

        // 3. fl_lp_sta_lsulpfusd - FUSD in LSULP reservoir
        const lsulpReservoirFusdUsd = yield* getUsdValueService({
          amount: lsulpReservoirFusd,
          resourceAddress: Assets.Fungible.fUSD,
          timestamp: input.timestamp,
        });
        results.push({
          activityId: ActivityId.fl_lp_sta_lsulpfusd,
          usdValue: lsulpReservoirFusdUsd.toString(),
          metadata: STORE_METADATA
            ? {
                [Assets.Fungible.fUSD]: lsulpReservoirFusd.toString(),
              }
            : undefined,
        });

        // 4. fl_lp_der_lsulpfusd - LSULP in LSULP reservoir (liquidity provision)
        const lsulpReservoirLpLsulpUsd = yield* getUsdValueService({
          amount: lsulpReservoirLsulp,
          resourceAddress: FluxConstants.collaterals.lsulp.collateralAddress,
          timestamp: input.timestamp,
        });
        results.push({
          activityId: ActivityId.fl_lp_der_lsulpfusd,
          usdValue: lsulpReservoirLpLsulpUsd.toString(),
          metadata: STORE_METADATA
            ? {
                [FluxConstants.collaterals.lsulp.collateralAddress]:
                  lsulpReservoirLsulp.toString(),
              }
            : undefined,
        });

        // 5. fl_lp_der_xrdfusd - XRD in XRD reservoir (liquidity provision)
        const xrdReservoirLpXrdUsd = yield* getUsdValueService({
          amount: xrdReservoirXrd,
          resourceAddress: Assets.Fungible.XRD,
          timestamp: input.timestamp,
        });
        results.push({
          activityId: ActivityId.fl_lp_der_xrdfusd,
          usdValue: xrdReservoirLpXrdUsd.toString(),
          metadata: STORE_METADATA
            ? {
                [Assets.Fungible.XRD]: xrdReservoirXrd.toString(),
              }
            : undefined,
        });

        return results;
      });
    }),
  },
) {}

export const AggregateFluxPositionsServiceLive =
  AggregateFluxPositionsService.Default;

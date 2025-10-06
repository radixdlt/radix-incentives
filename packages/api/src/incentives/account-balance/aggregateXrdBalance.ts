import { BigNumber } from 'bignumber.js';
import {
  type AccountBalanceData,
  ActivityId,
  Assets,
  DappConstants,
} from 'data';
import { Effect } from 'effect';
import { GetUsdValueService } from '../token-price/getUsdValue';
import type { AccountBalance as AccountBalanceFromSnapshot } from './getAccountBalancesAtStateVersion';

const CaviarNineConstants = DappConstants.CaviarNine.constants;
const FluxConstants = DappConstants.Flux.constants;

// Helper function to check if a resource address is XRD or LSULP

// Helper function to convert LSULP amount to XRD equivalent
const convertLsulpToXrd = (
  amount: BigNumber,
  lsulpValue: BigNumber,
): BigNumber => {
  return amount.multipliedBy(lsulpValue);
};

// Helper function to convert amount to XRD equivalent if it's LSULP
const toXrdEquivalent = (
  amount: BigNumber,
  resourceAddress: string,
  lsulpValue: BigNumber,
  convertLsuToXrdMap?: Map<string, (amount: BigNumber) => BigNumber>,
): BigNumber => {
  if (resourceAddress === CaviarNineConstants.LSULP.resourceAddress) {
    return convertLsulpToXrd(amount, lsulpValue);
  }
  // Handle LSU conversion
  if (convertLsuToXrdMap?.has(resourceAddress)) {
    const converter = convertLsuToXrdMap.get(resourceAddress);
    if (converter) {
      return converter(amount);
    }
  }
  return amount;
};

type XrdValueConverter = (
  amount: BigNumber,
  // biome-ignore lint/suspicious/noExplicitAny: Complex union type causing build issues
) => Effect.Effect<string, any>;

// Extract basic XRD holdings processing
const processBasicXrdHoldings = (
  accountBalance: AccountBalanceFromSnapshot,
  xrdToUsd: XrdValueConverter,
) =>
  Effect.gen(function* () {
    const output: AccountBalanceData[] = [];

    // Direct XRD holdings
    const xrd =
      accountBalance.fungibleTokenBalances.find(
        (resource) => resource.resourceAddress === Assets.Fungible.XRD,
      )?.amount ?? new BigNumber(0);

    output.push({
      activityId: ActivityId.ho_xrd,
      usdValue: yield* xrdToUsd(xrd),
    });

    // Staked XRD
    const stakedXrd = accountBalance.staked.reduce(
      (acc, item) => acc.plus(item.xrdAmount),
      new BigNumber(0),
    );

    output.push({
      activityId: ActivityId.ho_stakedXrd,
      usdValue: yield* xrdToUsd(stakedXrd),
    });

    // Unstaked XRD
    const unstakedXrd = accountBalance.unstaked.reduce(
      (acc, item) => acc.plus(item.amount),
      new BigNumber(0),
    );

    output.push({
      activityId: ActivityId.ho_unstakedXrd,
      usdValue: yield* xrdToUsd(unstakedXrd),
    });

    // LSULP (converted to XRD equivalent)
    const lsulpXrdEquivalent = convertLsulpToXrd(
      accountBalance.lsulp.amount,
      accountBalance.lsulp.lsulpValue,
    );

    output.push({
      activityId: ActivityId.ho_lsulp,
      usdValue: yield* xrdToUsd(lsulpXrdEquivalent),
    });

    return output;
  });

// Extract Surge margin account collateral processing
const processSurgeMarginAccountCollateral = (
  accountBalance: AccountBalanceFromSnapshot,
  xrdToUsd: XrdValueConverter,
) =>
  Effect.gen(function* () {
    const output: AccountBalanceData[] = [];

    let surgeMarginXrd = new BigNumber(0);
    let surgeMarginLsulp = new BigNumber(0);

    // Process all margin account balances for this user
    for (const marginBalance of accountBalance.surgeMarginAccountBalances ||
      []) {
      for (const resource of marginBalance.fungibleResources) {
        if (resource.resourceAddress === Assets.Fungible.XRD) {
          surgeMarginXrd = surgeMarginXrd.plus(resource.amount);
        } else if (
          resource.resourceAddress === CaviarNineConstants.LSULP.resourceAddress
        ) {
          // Convert LSULP to XRD equivalent for su_ho_lsulp activity
          const lsulpXrdEquivalent = convertLsulpToXrd(
            resource.amount,
            accountBalance.lsulp.lsulpValue,
          );
          surgeMarginLsulp = surgeMarginLsulp.plus(lsulpXrdEquivalent);
        }
      }
    }

    output.push(
      {
        activityId: ActivityId.su_ho_xrd,
        usdValue: yield* xrdToUsd(surgeMarginXrd),
      },
      {
        activityId: ActivityId.su_ho_lsulp,
        usdValue: yield* xrdToUsd(surgeMarginLsulp),
      },
    );

    return output;
  });

// Extract lending protocol processing
const processLendingProtocols = (
  accountBalance: AccountBalanceFromSnapshot,
  xrdToUsd: XrdValueConverter,
) =>
  Effect.gen(function* () {
    const output: AccountBalanceData[] = [];

    // Root Finance lending
    const rootFinanceLending = accountBalance.rootFinancePositions.reduce(
      (acc, position) => {
        // Check XRD collaterals
        if (position.collaterals?.[Assets.Fungible.XRD]) {
          acc.xrd = acc.xrd.plus(
            position.collaterals[Assets.Fungible.XRD] ?? 0,
          );
        }

        // Check LSULP collaterals and convert to XRD equivalent
        const lsulpCollateral =
          position.collaterals?.[CaviarNineConstants.LSULP.resourceAddress];

        if (lsulpCollateral) {
          const lsulpXrdEquivalent = convertLsulpToXrd(
            new BigNumber(lsulpCollateral),
            accountBalance.lsulp.lsulpValue,
          );
          acc.lsulp = acc.lsulp.plus(lsulpXrdEquivalent);
        }

        return acc;
      },
      { xrd: new BigNumber(0), lsulp: new BigNumber(0) },
    ) ?? { xrd: new BigNumber(0), lsulp: new BigNumber(0) };

    output.push(
      {
        activityId: ActivityId.ro_ho_xrd,
        usdValue: yield* xrdToUsd(rootFinanceLending.xrd),
      },
      {
        activityId: ActivityId.ro_ho_lsulp,
        usdValue: yield* xrdToUsd(rootFinanceLending.lsulp),
      },
    );

    // Weft Finance lending and collateral
    const weftFinancePositions = accountBalance.weftFinancePositions;

    // Process lending positions (only w2-assets like w2XRD and w2LSULP)
    const { weftLendingXrd, weftLendingLsulp } =
      weftFinancePositions.lending.reduce(
        (acc, position) => {
          if (position.unwrappedAsset.resourceAddress === Assets.Fungible.XRD) {
            acc.weftLendingXrd = acc.weftLendingXrd.plus(
              position.unwrappedAsset.amount,
            );
          }
          if (
            position.unwrappedAsset.resourceAddress === Assets.Fungible.LSULP
          ) {
            acc.weftLendingLsulp = acc.weftLendingLsulp.plus(
              convertLsulpToXrd(
                position.unwrappedAsset.amount,
                accountBalance.lsulp.lsulpValue,
              ),
            );
          }
          return acc;
        },
        {
          weftLendingXrd: new BigNumber(0),
          weftLendingLsulp: new BigNumber(0),
        },
      );

    // Process collateral positions
    let weftCollateralXrd = new BigNumber(0);
    let weftCollateralLsulp = new BigNumber(0);
    let weftCollateralStakedXrd = new BigNumber(0);

    for (const position of weftFinancePositions.collateral) {
      if (position.resourceAddress === Assets.Fungible.XRD) {
        // Direct XRD collateral
        weftCollateralXrd = weftCollateralXrd.plus(position.amount);
      } else if (
        position.resourceAddress === CaviarNineConstants.LSULP.resourceAddress
      ) {
        // LSULP collateral - convert to XRD equivalent
        const lsulpXrdEquivalent = convertLsulpToXrd(
          position.amount,
          accountBalance.lsulp.lsulpValue,
        );
        weftCollateralLsulp = weftCollateralLsulp.plus(lsulpXrdEquivalent);
      } else if (
        accountBalance.convertLsuToXrdMap?.has(position.resourceAddress)
      ) {
        // Only process if it's actually an LSU (exists in the conversion map)
        const xrdAmount = toXrdEquivalent(
          position.amount,
          position.resourceAddress,
          accountBalance.lsulp.lsulpValue,
          accountBalance.convertLsuToXrdMap,
        );

        weftCollateralStakedXrd = weftCollateralStakedXrd.plus(xrdAmount);
      }
      // Skip any other resources that aren't XRD, LSULP, or actual LSUs
    }

    // Add combined lending + collateral results
    const totalWeftXrd = weftLendingXrd.plus(weftCollateralXrd);
    const totalWeftLsulp = weftLendingLsulp.plus(weftCollateralLsulp); // Only from collateral

    output.push(
      {
        activityId: ActivityId.we_ho_xrd,
        usdValue: yield* xrdToUsd(totalWeftXrd),
      },
      {
        activityId: ActivityId.we_ho_lsulp,
        usdValue: yield* xrdToUsd(totalWeftLsulp),
      },
    );

    // Add aggregated staked XRD from LSU collaterals
    output.push({
      activityId: ActivityId.we_ho_stakedXrd,
      usdValue: yield* xrdToUsd(weftCollateralStakedXrd),
    });

    // Process Weft unstaking receipts from NFT collaterals
    // Aggregate all unstaking receipts into a single entry
    const totalUnstakingXrd = weftFinancePositions.unstakingReceipts.reduce(
      (acc, receipt) => acc.plus(receipt.claimAmount),
      new BigNumber(0),
    );

    output.push({
      activityId: ActivityId.we_ho_unstakedXrd,
      usdValue: yield* xrdToUsd(totalUnstakingXrd),
    });

    return output;
  });

// Extract Flux collateral and reservoir processing
const processFluxPositions = (
  accountBalance: AccountBalanceFromSnapshot,
  xrdToUsd: XrdValueConverter,
) =>
  Effect.gen(function* () {
    const output: AccountBalanceData[] = [];

    let xrdCollateral = new BigNumber(0);
    let lsulpCollateral = new BigNumber(0);
    let xrdReservoirXrd = new BigNumber(0);
    let lsulpReservoirLsulp = new BigNumber(0);

    // Aggregate CDP collateral
    if (accountBalance.fluxCdpPositions.cdpPositions) {
      for (const cdp of accountBalance.fluxCdpPositions.cdpPositions) {
        const collateralAmount = new BigNumber(cdp.collateralAmount);
        if (collateralAmount.isFinite() && !collateralAmount.isNaN()) {
          if (
            cdp.collateralAddress ===
            FluxConstants.collaterals.xrd.collateralAddress
          ) {
            xrdCollateral = xrdCollateral.plus(collateralAmount);
          } else if (
            cdp.collateralAddress ===
            FluxConstants.collaterals.lsulp.collateralAddress
          ) {
            // Convert LSULP to XRD equivalent
            const lsulpXrdEquivalent = convertLsulpToXrd(
              collateralAmount,
              accountBalance.lsulp.lsulpValue,
            );
            lsulpCollateral = lsulpCollateral.plus(lsulpXrdEquivalent);
          }
        }
      }
    }

    // Aggregate Reservoir positions (collateral part only)
    if (accountBalance.fluxReservoirPositions.reservoirPositions) {
      for (const reservoir of accountBalance.fluxReservoirPositions
        .reservoirPositions) {
        const collateralValue = new BigNumber(
          reservoir.userPoolTokenValue.collateral,
        );

        if (collateralValue.isFinite() && !collateralValue.isNaN()) {
          if (
            reservoir.collateralAddress ===
            FluxConstants.collaterals.xrd.collateralAddress
          ) {
            xrdReservoirXrd = xrdReservoirXrd.plus(collateralValue);
          } else if (
            reservoir.collateralAddress ===
            FluxConstants.collaterals.lsulp.collateralAddress
          ) {
            // Convert LSULP to XRD equivalent
            const lsulpXrdEquivalent = convertLsulpToXrd(
              collateralValue,
              accountBalance.lsulp.lsulpValue,
            );
            lsulpReservoirLsulp = lsulpReservoirLsulp.plus(lsulpXrdEquivalent);
          }
        }
      }
    }

    output.push(
      {
        activityId: ActivityId.fl_ho_xrd,
        usdValue: yield* xrdToUsd(xrdCollateral),
      },
      {
        activityId: ActivityId.fl_ho_lsulp,
        usdValue: yield* xrdToUsd(lsulpCollateral),
      },
      {
        activityId: ActivityId.fl_ho_xrdfusd,
        usdValue: yield* xrdToUsd(xrdReservoirXrd),
      },
      {
        activityId: ActivityId.fl_ho_lsulpfusd,
        usdValue: yield* xrdToUsd(lsulpReservoirLsulp),
      },
    );

    return output;
  });

export type XrdBalanceInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type XrdBalanceOutput = Effect.Effect.Success<
  Awaited<ReturnType<(typeof XrdBalanceService)['Service']>>
>;

export class XrdBalanceService extends Effect.Service<XrdBalanceService>()(
  'XrdBalanceService',
  {
    dependencies: [GetUsdValueService.Default],
    effect: Effect.gen(function* () {
      const getUsdValueService = yield* GetUsdValueService;

      // Create reusable XRD to USD converter

      return Effect.fn(function* (input: XrdBalanceInput) {
        const xrdToUsd = (amount: BigNumber) =>
          getUsdValueService({
            amount,
            resourceAddress: Assets.Fungible.XRD,
            timestamp: input.timestamp,
          }).pipe(Effect.map((usdValue) => usdValue.toString()));

        // Process all different types of XRD holdings in parallel
        const [
          basicHoldings,
          lendingHoldings,
          surgeMarginHoldings,
          fluxHoldings,
        ] = yield* Effect.all([
          processBasicXrdHoldings(input.accountBalance, xrdToUsd),
          processLendingProtocols(input.accountBalance, xrdToUsd),
          processSurgeMarginAccountCollateral(input.accountBalance, xrdToUsd),
          processFluxPositions(input.accountBalance, xrdToUsd),
        ]);

        // Combine all results
        return [
          ...basicHoldings,
          ...lendingHoldings,
          ...surgeMarginHoldings,
          ...fluxHoldings,
        ];
      });
    }),
  },
) {}

export const XrdBalanceLive = XrdBalanceService.Default;

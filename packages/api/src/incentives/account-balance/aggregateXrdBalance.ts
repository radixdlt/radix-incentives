import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import { Assets } from "../../common/assets/constants";
import { CaviarNineConstants } from "../../common/dapps/caviarnine/constants";
import { OciswapConstants } from "../../common/dapps/ociswap/constants";
import { DefiPlaza } from "../../common/dapps/defiplaza/constants";
import {
  AddressValidationService,
  type UnknownTokenError,
} from "../../common/address-validation/addressValidation";

import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import type { AccountBalanceData, ActivityId } from "db/incentives";
import type { GetWeftFinancePositionsOutput } from "../../common/dapps/weftFinance/getWeftFinancePositions";

// Helper function to check if a resource address is XRD or LSULP
const isXrdOrLsulp = (resourceAddress: string): boolean => {
  return (
    resourceAddress === Assets.Fungible.XRD ||
    resourceAddress === CaviarNineConstants.LSULP.resourceAddress
  );
};

// Helper function to convert LSULP amount to XRD equivalent
const convertLsulpToXrd = (
  amount: BigNumber,
  lsulpValue: BigNumber
): BigNumber => {
  return amount.multipliedBy(lsulpValue);
};

// Helper function to convert amount to XRD equivalent if it's LSULP
const toXrdEquivalent = (
  amount: BigNumber,
  resourceAddress: string,
  lsulpValue: BigNumber,
  convertLsuToXrdMap?: Map<string, (amount: BigNumber) => BigNumber>
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
  amount: BigNumber
) => Effect.Effect<string, GetUsdValueServiceError>;

// Extract basic XRD holdings processing
const processBasicXrdHoldings = (
  accountBalance: AccountBalanceFromSnapshot,
  xrdToUsd: XrdValueConverter
) =>
  Effect.gen(function* () {
    const output: AccountBalanceData[] = [];

    // Direct XRD holdings
    const xrd =
      accountBalance.fungibleTokenBalances.find(
        (resource) => resource.resourceAddress === Assets.Fungible.XRD
      )?.amount ?? new BigNumber(0);

    output.push({
      activityId: "hold_xrd",
      usdValue: yield* xrdToUsd(xrd),
    });

    // Staked XRD
    const stakedXrd = accountBalance.staked.reduce(
      (acc, item) => acc.plus(item.xrdAmount),
      new BigNumber(0)
    );

    output.push({
      activityId: "hold_stakedXrd",
      usdValue: yield* xrdToUsd(stakedXrd),
    });

    // Unstaked XRD
    const unstakedXrd = accountBalance.unstaked.reduce(
      (acc, item) => acc.plus(item.amount),
      new BigNumber(0)
    );

    output.push({
      activityId: "hold_unstakedXrd",
      usdValue: yield* xrdToUsd(unstakedXrd),
    });

    // LSULP (converted to XRD equivalent)
    const lsulpXrdEquivalent = convertLsulpToXrd(
      accountBalance.lsulp.amount,
      accountBalance.lsulp.lsulpValue
    );

    output.push({
      activityId: "hold_lsulp",
      usdValue: yield* xrdToUsd(lsulpXrdEquivalent),
    });

    return output;
  });

// Extract lending protocol processing
const processLendingProtocols = (
  accountBalance: AccountBalanceFromSnapshot,
  xrdToUsd: XrdValueConverter
) =>
  Effect.gen(function* () {
    const output: AccountBalanceData[] = [];

    // Root Finance lending
    const rootFinanceLending = accountBalance.rootFinancePositions.reduce(
      (acc, position) => {
        // Check XRD collaterals
        if (position.collaterals?.[Assets.Fungible.XRD]) {
          acc.xrd = acc.xrd.plus(
            position.collaterals[Assets.Fungible.XRD] ?? 0
          );
        }

        // Check LSULP collaterals and convert to XRD equivalent
        const lsulpCollateral =
          position.collaterals?.[CaviarNineConstants.LSULP.resourceAddress];
        if (lsulpCollateral) {
          const lsulpXrdEquivalent = convertLsulpToXrd(
            new BigNumber(lsulpCollateral),
            accountBalance.lsulp.lsulpValue
          );
          acc.lsulp = acc.lsulp.plus(lsulpXrdEquivalent);
        }

        return acc;
      },
      { xrd: new BigNumber(0), lsulp: new BigNumber(0) }
    ) ?? { xrd: new BigNumber(0), lsulp: new BigNumber(0) };

    output.push(
      {
        activityId: "root_hold_xrd",
        usdValue: yield* xrdToUsd(rootFinanceLending.xrd),
      },
      {
        activityId: "root_hold_lsulp",
        usdValue: yield* xrdToUsd(rootFinanceLending.lsulp),
      }
    );

    // Weft Finance lending and collateral
    const weftFinancePositions = accountBalance.weftFinancePositions;

    // Process lending positions (only w2-assets like w2XRD)
    const weftLendingXrd = weftFinancePositions.lending.reduce(
      (
        acc: BigNumber,
        position: GetWeftFinancePositionsOutput["lending"][number]
      ) => {
        if (position.unwrappedAsset.resourceAddress === Assets.Fungible.XRD) {
          return acc.plus(position.unwrappedAsset.amount);
        }
        return acc;
      },
      new BigNumber(0)
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
          accountBalance.lsulp.lsulpValue
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
          accountBalance.convertLsuToXrdMap
        );

        weftCollateralStakedXrd = weftCollateralStakedXrd.plus(xrdAmount);
      }
      // Skip any other resources that aren't XRD, LSULP, or actual LSUs
    }

    // Add combined lending + collateral results
    const totalWeftXrd = weftLendingXrd.plus(weftCollateralXrd);
    const totalWeftLsulp = weftCollateralLsulp; // Only from collateral

    output.push(
      {
        activityId: "weft_hold_xrd",
        usdValue: yield* xrdToUsd(totalWeftXrd),
      },
      {
        activityId: "weft_hold_lsulp",
        usdValue: yield* xrdToUsd(totalWeftLsulp),
      }
    );

    // Add aggregated staked XRD from LSU collaterals
    if (weftCollateralStakedXrd.gt(0)) {
      output.push({
        activityId: "weft_hold_stakedXrd" as ActivityId,
        usdValue: yield* xrdToUsd(weftCollateralStakedXrd),
      });
    }

    // Process Weft unstaking receipts from NFT collaterals
    // Aggregate all unstaking receipts into a single entry
    const totalUnstakingXrd = weftFinancePositions.unstakingReceipts.reduce(
      (acc, receipt) => acc.plus(receipt.claimAmount),
      new BigNumber(0)
    );

    if (totalUnstakingXrd.gt(0)) {
      output.push({
        activityId: "weft_hold_unstakedXrd" as ActivityId,
        usdValue: yield* xrdToUsd(totalUnstakingXrd),
      });
    }

    return output;
  });

// Extract CaviarNine pool processing
const processCaviarNinePools = (
  accountBalance: AccountBalanceFromSnapshot,
  xrdToUsd: XrdValueConverter,
  addressValidationService: {
    getTokenName: (address: string) => Effect.Effect<string, UnknownTokenError>;
  }
) =>
  Effect.gen(function* () {
    const output: AccountBalanceData[] = [];
    const caviarNineByPool = new Map<ActivityId, BigNumber>();

    // Process existing positions
    for (const [_poolKey, poolAssets] of Object.entries(
      accountBalance.caviarninePositions
    )) {
      const poolXrdDerivatives = poolAssets.reduce((currentXrd, item) => {
        let newXrd = currentXrd;

        // Process xToken
        if (isXrdOrLsulp(item.xToken.resourceAddress)) {
          const tokenAmount = new BigNumber(item.xToken.withinPriceBounds).plus(
            new BigNumber(item.xToken.outsidePriceBounds)
          );
          const xrdEquivalent = toXrdEquivalent(
            tokenAmount,
            item.xToken.resourceAddress,
            accountBalance.lsulp.lsulpValue,
            accountBalance.convertLsuToXrdMap
          );
          newXrd = newXrd.plus(xrdEquivalent);
        }

        // Process yToken
        if (isXrdOrLsulp(item.yToken.resourceAddress)) {
          const tokenAmount = new BigNumber(item.yToken.withinPriceBounds).plus(
            new BigNumber(item.yToken.outsidePriceBounds)
          );
          const xrdEquivalent = toXrdEquivalent(
            tokenAmount,
            item.yToken.resourceAddress,
            accountBalance.lsulp.lsulpValue,
            accountBalance.convertLsuToXrdMap
          );
          newXrd = newXrd.plus(xrdEquivalent);
        }

        return newXrd;
      }, new BigNumber(0));

      if (poolAssets.length > 0) {
        const firstAsset = poolAssets[0];
        if (firstAsset) {
          const { xToken, yToken } = firstAsset;
          const isXTokenXrdDerivative = isXrdOrLsulp(xToken.resourceAddress);
          const isYTokenXrdDerivative = isXrdOrLsulp(yToken.resourceAddress);

          if (isXTokenXrdDerivative || isYTokenXrdDerivative) {
            const nonXrdDerivativeToken = isXTokenXrdDerivative
              ? yToken
              : xToken;
            const xrdDerivativeToken = isXTokenXrdDerivative ? xToken : yToken;

            const nonXrdDerivativeTokenName =
              yield* addressValidationService.getTokenName(
                nonXrdDerivativeToken.resourceAddress
              );
            const xrdDerivativeTokenName =
              yield* addressValidationService.getTokenName(
                xrdDerivativeToken.resourceAddress
              );
            const activityId =
              `c9_hold_${xrdDerivativeTokenName}-${nonXrdDerivativeTokenName}` as ActivityId;

            const currentAmount =
              caviarNineByPool.get(activityId) ?? new BigNumber(0);
            caviarNineByPool.set(
              activityId,
              currentAmount.plus(poolXrdDerivatives)
            );
          }
        }
      }
    }

    // Process Hyperstake positions (LSULP/XRD pool)
    if (accountBalance.hyperstakePositions.items.length > 0) {
      let totalHyperstakeXrdDerivatives = new BigNumber(0);

      for (const hyperstakeItem of accountBalance.hyperstakePositions.items) {
        for (const position of hyperstakeItem.position) {
          // Convert both LSULP and XRD to XRD equivalent for tracking
          const xrdEquivalent = toXrdEquivalent(
            position.amount,
            position.resourceAddress,
            accountBalance.lsulp.lsulpValue,
            accountBalance.convertLsuToXrdMap
          );

          totalHyperstakeXrdDerivatives =
            totalHyperstakeXrdDerivatives.plus(xrdEquivalent);
        }
      }

      const hyperstakeActivityId = "c9_hold_hyperstake" as ActivityId;
      caviarNineByPool.set(hyperstakeActivityId, totalHyperstakeXrdDerivatives);
    }

    // Add zero entry for Hyperstake if not processed
    const hyperstakeActivityId = "c9_hold_hyperstake" as ActivityId;
    if (!caviarNineByPool.has(hyperstakeActivityId)) {
      caviarNineByPool.set(hyperstakeActivityId, new BigNumber(0));
    }

    // Add results for pools with positions (including hyperstake)
    for (const [activityId, xrdAmount] of caviarNineByPool.entries()) {
      output.push({
        activityId,
        usdValue: yield* xrdToUsd(xrdAmount),
      });
    }

    // Add zero entries for pools without positions
    for (const pool of Object.values(CaviarNineConstants.shapeLiquidityPools)) {
      const isToken1XrdDerivative = isXrdOrLsulp(pool.token_x);
      const isToken2XrdDerivative = isXrdOrLsulp(pool.token_y);

      if (isToken1XrdDerivative || isToken2XrdDerivative) {
        const nonXrdDerivativeTokenAddress = isToken1XrdDerivative
          ? pool.token_y
          : pool.token_x;
        const xrdDerivativeTokenAddress = isToken1XrdDerivative
          ? pool.token_x
          : pool.token_y;

        const nonXrdDerivativeTokenName =
          yield* addressValidationService.getTokenName(
            nonXrdDerivativeTokenAddress
          );
        const xrdDerivativeTokenName =
          yield* addressValidationService.getTokenName(
            xrdDerivativeTokenAddress
          );
        const activityId =
          `c9_hold_${xrdDerivativeTokenName}-${nonXrdDerivativeTokenName}` as ActivityId;

        if (!caviarNineByPool.has(activityId)) {
          output.push({
            activityId,
            usdValue: yield* xrdToUsd(new BigNumber(0)),
          });
        }
      }
    }

    return output;
  });

// Extract DefiPlaza pool processing
const processDefiPlazaPools = (
  accountBalance: AccountBalanceFromSnapshot,
  xrdToUsd: XrdValueConverter,
  addressValidationService: {
    getTokenName: (address: string) => Effect.Effect<string, UnknownTokenError>;
  }
) =>
  Effect.gen(function* () {
    const output: AccountBalanceData[] = [];
    const defiPlazaByPool = new Map<ActivityId, BigNumber>();

    // Process existing positions
    for (const lpPosition of accountBalance.defiPlazaPositions.items) {
      const xrdDerivativePosition = lpPosition.position.find((pos) =>
        isXrdOrLsulp(pos.resourceAddress)
      );
      const nonXrdDerivativePosition = lpPosition.position.find(
        (pos) => !isXrdOrLsulp(pos.resourceAddress)
      );

      if (xrdDerivativePosition && nonXrdDerivativePosition) {
        const pool = Object.values(DefiPlaza).find(
          (p) => p.baseLpResourceAddress === lpPosition.lpResourceAddress
        );

        if (
          pool &&
          (isXrdOrLsulp(pool.baseResourceAddress) ||
            isXrdOrLsulp(pool.quoteResourceAddress))
        ) {
          const isBaseXrdDerivative = isXrdOrLsulp(pool.baseResourceAddress);
          const nonXrdDerivativeTokenAddress = isBaseXrdDerivative
            ? pool.quoteResourceAddress
            : pool.baseResourceAddress;
          const xrdDerivativeTokenAddress = isBaseXrdDerivative
            ? pool.baseResourceAddress
            : pool.quoteResourceAddress;

          const nonXrdDerivativeTokenName =
            yield* addressValidationService.getTokenName(
              nonXrdDerivativeTokenAddress
            );
          const xrdDerivativeTokenName =
            yield* addressValidationService.getTokenName(
              xrdDerivativeTokenAddress
            );
          const activityId =
            `defiPlaza_hold_${xrdDerivativeTokenName}-${nonXrdDerivativeTokenName}` as ActivityId;

          const currentAmount =
            defiPlazaByPool.get(activityId) ?? new BigNumber(0);
          const xrdDerivativeAmount = toXrdEquivalent(
            xrdDerivativePosition.amount,
            xrdDerivativePosition.resourceAddress,
            accountBalance.lsulp.lsulpValue,
            accountBalance.convertLsuToXrdMap
          );

          defiPlazaByPool.set(
            activityId,
            currentAmount.plus(xrdDerivativeAmount)
          );
        }
      }
    }

    // Add results for pools with positions
    for (const [activityId, xrdAmount] of defiPlazaByPool.entries()) {
      output.push({
        activityId,
        usdValue: yield* xrdToUsd(xrdAmount),
      });
    }

    // Add zero entries for pools without positions
    for (const pool of Object.values(DefiPlaza)) {
      const isBaseXrdDerivative = isXrdOrLsulp(pool.baseResourceAddress);
      const isQuoteXrdDerivative = isXrdOrLsulp(pool.quoteResourceAddress);

      if (isBaseXrdDerivative || isQuoteXrdDerivative) {
        const nonXrdDerivativeTokenAddress = isBaseXrdDerivative
          ? pool.quoteResourceAddress
          : pool.baseResourceAddress;
        const xrdDerivativeTokenAddress = isBaseXrdDerivative
          ? pool.baseResourceAddress
          : pool.quoteResourceAddress;

        const nonXrdDerivativeTokenName =
          yield* addressValidationService.getTokenName(
            nonXrdDerivativeTokenAddress
          );
        const xrdDerivativeTokenName =
          yield* addressValidationService.getTokenName(
            xrdDerivativeTokenAddress
          );
        const activityId =
          `defiPlaza_hold_${xrdDerivativeTokenName}-${nonXrdDerivativeTokenName}` as ActivityId;

        if (!defiPlazaByPool.has(activityId)) {
          output.push({
            activityId,
            usdValue: yield* xrdToUsd(new BigNumber(0)),
          });
        }
      }
    }

    return output;
  });

// Extract OciSwap pool processing
const processOciswapPools = (
  accountBalance: AccountBalanceFromSnapshot,
  xrdToUsd: XrdValueConverter,
  addressValidationService: {
    getTokenName: (address: string) => Effect.Effect<string, UnknownTokenError>;
  }
) =>
  Effect.gen(function* () {
    const output: AccountBalanceData[] = [];
    const ociswapByPool = new Map<ActivityId, BigNumber>();

    // Process existing positions
    for (const [_poolKey, poolAssets] of Object.entries(
      accountBalance.ociswapPositions
    )) {
      const poolXrdAmount = poolAssets.reduce((currentXrd, item) => {
        let newXrd = currentXrd;

        // Process xToken (use totalAmount for ALL XRD, not just in bounds)
        if (item.xToken.resourceAddress === Assets.Fungible.XRD) {
          const tokenAmount = new BigNumber(item.xToken.totalAmount);
          newXrd = newXrd.plus(tokenAmount);
        }

        // Process yToken (use totalAmount for ALL XRD, not just in bounds)
        if (item.yToken.resourceAddress === Assets.Fungible.XRD) {
          const tokenAmount = new BigNumber(item.yToken.totalAmount);
          newXrd = newXrd.plus(tokenAmount);
        }

        return newXrd;
      }, new BigNumber(0));

      if (poolAssets.length > 0) {
        const firstAsset = poolAssets[0];
        if (firstAsset) {
          const { xToken, yToken } = firstAsset;
          const isXTokenXrd = xToken.resourceAddress === Assets.Fungible.XRD;
          const isYTokenXrd = yToken.resourceAddress === Assets.Fungible.XRD;

          if (isXTokenXrd || isYTokenXrd) {
            const nonXrdToken = isXTokenXrd ? yToken : xToken;
            const xrdToken = isXTokenXrd ? xToken : yToken;

            const nonXrdTokenName =
              yield* addressValidationService.getTokenName(
                nonXrdToken.resourceAddress
              );
            const xrdTokenName = yield* addressValidationService.getTokenName(
              xrdToken.resourceAddress
            );
            // Alphabetically sort token names for activityId
            const [tokenA, tokenB] = [xrdTokenName, nonXrdTokenName].sort();
            const activityId = `oci_hold_${tokenA}-${tokenB}` as ActivityId;

            const currentAmount =
              ociswapByPool.get(activityId) ?? new BigNumber(0);
            ociswapByPool.set(activityId, currentAmount.plus(poolXrdAmount));
          }
        }
      }
    }

    // Add results for pools with positions
    for (const [activityId, xrdAmount] of ociswapByPool.entries()) {
      output.push({
        activityId,
        usdValue: yield* xrdToUsd(xrdAmount),
      });
    }

    // Add zero entries for pools without positions
    for (const pool of Object.values(OciswapConstants.pools)) {
      const isTokenXXrd = pool.token_x === Assets.Fungible.XRD;
      const isTokenYXrd = pool.token_y === Assets.Fungible.XRD;

      if (isTokenXXrd || isTokenYXrd) {
        const nonXrdTokenAddress = isTokenXXrd ? pool.token_y : pool.token_x;
        const xrdTokenAddress = isTokenXXrd ? pool.token_x : pool.token_y;

        const nonXrdTokenName =
          yield* addressValidationService.getTokenName(nonXrdTokenAddress);
        const xrdTokenName =
          yield* addressValidationService.getTokenName(xrdTokenAddress);
        // Alphabetically sort token names for activityId
        const [tokenA, tokenB] = [xrdTokenName, nonXrdTokenName].sort();
        const activityId = `oci_hold_${tokenA}-${tokenB}` as ActivityId;

        if (!ociswapByPool.has(activityId)) {
          output.push({
            activityId,
            usdValue: yield* xrdToUsd(new BigNumber(0)),
          });
        }
      }
    }

    return output;
  });

export type XrdBalanceInput = {
  accountBalance: AccountBalanceFromSnapshot;
  timestamp: Date;
};

export type XrdBalanceOutput = AccountBalanceData;

export class XrdBalanceService extends Context.Tag("XrdBalanceService")<
  XrdBalanceService,
  (
    input: XrdBalanceInput
  ) => Effect.Effect<
    XrdBalanceOutput[],
    GetUsdValueServiceError | UnknownTokenError
  >
>() {}

export const XrdBalanceLive = Layer.effect(
  XrdBalanceService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    const addressValidationService = yield* AddressValidationService;

    return (input) =>
      Effect.gen(function* () {
        // Create reusable XRD to USD converter
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
          caviarNineHoldings,
          ociswapHoldings,
          defiPlazaHoldings,
        ] = yield* Effect.all([
          processBasicXrdHoldings(input.accountBalance, xrdToUsd),
          processLendingProtocols(input.accountBalance, xrdToUsd),
          processCaviarNinePools(
            input.accountBalance,
            xrdToUsd,
            addressValidationService
          ),
          processOciswapPools(
            input.accountBalance,
            xrdToUsd,
            addressValidationService
          ),
          processDefiPlazaPools(
            input.accountBalance,
            xrdToUsd,
            addressValidationService
          ),
        ]);

        // Combine all results
        return [
          ...basicHoldings,
          ...lendingHoldings,
          ...caviarNineHoldings,
          ...ociswapHoldings,
          ...defiPlazaHoldings,
        ];
      });
  })
);

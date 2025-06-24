import { Effect, Layer } from "effect";
import type { AccountBalance as AccountBalanceFromSnapshot } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import { Assets } from "../../common/assets/constants";
import { CaviarNineConstants } from "../../common/dapps/caviarnine/constants";

import {
  GetUsdValueService,
  type InvalidResourceAddressError,
  type PriceServiceApiError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";
import type { AccountBalanceData } from "db/incentives";

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
    InvalidResourceAddressError | PriceServiceApiError,
    GetUsdValueService
  >
>() {}

export const XrdBalanceLive = Layer.effect(
  XrdBalanceService,
  Effect.gen(function* () {
    const getUsdValueService = yield* GetUsdValueService;
    return (input) =>
      Effect.gen(function* () {
        const output: AccountBalanceData[] = [];

        const xrdToUsdValue = (amount: BigNumber) =>
          getUsdValueService({
            amount,
            resourceAddress: Assets.Fungible.XRD,
            timestamp: input.timestamp,
          }).pipe(Effect.map((usdValue) => usdValue.toString()));

        const xrd =
          input.accountBalance.fungibleTokenBalances.find(
            (resource) => resource.resourceAddress === Assets.Fungible.XRD
          )?.amount ?? new BigNumber(0);

        output.push({
          activityId: "hold_xrd",
          usdValue: yield* xrdToUsdValue(xrd),
        });

        const stakedXrd = input.accountBalance.staked.reduce(
          (acc, item) => acc.plus(item.xrdAmount),
          new BigNumber(0)
        );

        output.push({
          activityId: "hold_stakedXrd",
          usdValue: yield* xrdToUsdValue(stakedXrd),
        });

        const unstakedXrd = input.accountBalance.unstaked.reduce(
          (acc, item) => acc.plus(item.amount),
          new BigNumber(0)
        );

        output.push({
          activityId: "hold_unstakedXrd",
          usdValue: yield* xrdToUsdValue(unstakedXrd),
        });

        const lsulp = input.accountBalance.lsulp.amount.multipliedBy(
          input.accountBalance.lsulp.lsulpValue
        );

        output.push({
          activityId: "hold_lsulp",
          usdValue: yield* xrdToUsdValue(lsulp),
        });

        const rootFinanceLending =
          input.accountBalance.rootFinancePositions.reduce(
            (acc, position) => {
              // Check XRD collaterals
              if (position.collaterals?.[Assets.Fungible.XRD]) {
                acc.xrd = acc.xrd.plus(
                  position.collaterals[Assets.Fungible.XRD] ?? 0
                );
              }

              // Check LSULP collaterals
              if (
                position.collaterals?.[
                  CaviarNineConstants.LSULP.resourceAddress
                ]
              ) {
                acc.lsulp = acc.lsulp.plus(
                  position.collaterals[
                    CaviarNineConstants.LSULP.resourceAddress
                  ] ?? 0
                );
              }

              return acc;
            },
            { xrd: new BigNumber(0), lsulp: new BigNumber(0) }
          ) ?? { xrd: new BigNumber(0), lsulp: new BigNumber(0) };

        output.push({
          activityId: "root_hold_xrd",
          usdValue: yield* xrdToUsdValue(rootFinanceLending.xrd),
        });

        output.push({
          activityId: "root_hold_lsulp",
          usdValue: yield* xrdToUsdValue(rootFinanceLending.lsulp),
        });

        const weftFinanceLending =
          input.accountBalance.weftFinancePositions.reduce(
            (acc, position) => {
              if (
                position.unwrappedAsset.resourceAddress === Assets.Fungible.XRD
              ) {
                acc.xrd = acc.xrd.plus(position.unwrappedAsset.amount);
              }

              if (
                position.unwrappedAsset.resourceAddress ===
                CaviarNineConstants.LSULP.resourceAddress
              ) {
                acc.lsulp = acc.lsulp.plus(position.unwrappedAsset.amount);
              }

              return acc;
            },
            { xrd: new BigNumber(0), lsulp: new BigNumber(0) }
          ) ?? { xrd: new BigNumber(0), lsulp: new BigNumber(0) };

        output.push({
          activityId: "weft_hold_xrd",
          usdValue: yield* xrdToUsdValue(weftFinanceLending.xrd),
        });

        output.push({
          activityId: "weft_hold_lsulp",
          usdValue: yield* xrdToUsdValue(weftFinanceLending.lsulp),
        });

        const caviarNine =
          input.accountBalance.caviarninePositions.xrdUsdc.reduce(
            (acc, item) => {
              // Only count XRD tokens from either xToken or yToken
              if (item.xToken.resourceAddress === Assets.Fungible.XRD) {
                acc.xrd = acc.xrd
                  .plus(item.xToken.withinPriceBounds)
                  .plus(item.xToken.outsidePriceBounds);
              }
              if (item.yToken.resourceAddress === Assets.Fungible.XRD) {
                acc.xrd = acc.xrd
                  .plus(item.yToken.withinPriceBounds)
                  .plus(item.yToken.outsidePriceBounds);
              }

              return acc;
            },
            { xrd: new BigNumber(0) }
          );

        output.push({
          activityId: "c9_hold_xrd-xusdc",
          usdValue: yield* xrdToUsdValue(caviarNine.xrd),
        });

        const defiPlaza = input.accountBalance.defiPlazaPositions.items.reduce(
          (acc, lpPosition) => {
            // Find XRD positions in DefiPlaza LP
            const xrdPosition = lpPosition.position.find(
              (pos) => pos.resourceAddress === Assets.Fungible.XRD
            );
            if (xrdPosition) {
              acc.xrd = acc.xrd.plus(xrdPosition.amount);
            }
            return acc;
          },
          { xrd: new BigNumber(0) }
        );

        output.push({
          activityId: "defiPlaza_hold_xrd-xusdc",
          usdValue: yield* xrdToUsdValue(defiPlaza.xrd),
        });

        return output;
      });
  })
);

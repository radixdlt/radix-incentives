import { Effect, Layer } from "effect";
import type { AccountBalance } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import { Assets } from "../../common/assets/constants";
import { CaviarNineConstants } from "../../common/dapps/caviarnine/constants";

import {
  GetUsdValueService,
  type InvalidResourceAddressError,
  type PriceServiceApiError,
} from "../token-price/getUsdValue";
import { BigNumber } from "bignumber.js";

type XrdBalance = {
  type: "maintainXrdBalance";
  xrd: string;
  stakedXrd: string;
  unstakedXrd: string;
  lsulp: string;
  xrdPrice: string;
  rootFinanceXrd: string;
  rootFinanceLsulp: string;
  weftFinanceXrd: string;
  weftFinanceLsulp: string;
  caviarNineXrd: string;
};

// biome
type NoData = {
  type: "no_data";
};

export type XrdBalanceInput = {
  accountBalance: AccountBalance;
  timestamp: Date;
};

export type XrdBalanceOutput = {
  timestamp: Date;
  address: string;
  activityId: string;
  usdValue: BigNumber;
  data: XrdBalance | NoData;
};

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
        const xrd =
          input.accountBalance.fungibleTokenBalances.find(
            (resource) => resource.resourceAddress === Assets.Fungible.XRD
          )?.amount ?? new BigNumber(0);

        const stakedXrd = input.accountBalance.staked.reduce(
          (acc, item) => acc.plus(item.xrdAmount),
          new BigNumber(0)
        );
        const unstakedXrd = input.accountBalance.unstaked.reduce(
          (acc, item) => acc.plus(item.amount),
          new BigNumber(0)
        );
        const lsulp = input.accountBalance.lsulp.amount.multipliedBy(
          input.accountBalance.lsulp.lsulpValue
        );

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

        const caviarNine =
          input.accountBalance.caviarninePositions.xrdUsdc.reduce(
            (acc, item) => {
              acc.xrd = acc.xrd
                .plus(item.xToken.withinPriceBounds)
                .plus(item.xToken.outsidePriceBounds);

              return acc;
            },
            { xrd: new BigNumber(0) }
          );

        const xrdPrice = yield* getUsdValueService({
          timestamp: input.timestamp,
          resourceAddress: Assets.Fungible.XRD,
          amount: new BigNumber(1),
        });

        const data: XrdBalance = {
          type: "maintainXrdBalance",
          xrd: xrd.toString(),
          stakedXrd: stakedXrd.toString(),
          unstakedXrd: unstakedXrd.toString(),
          xrdPrice: xrdPrice.toString(),
          lsulp: lsulp.toString(),
          rootFinanceXrd: rootFinanceLending.xrd.toString(),
          rootFinanceLsulp: rootFinanceLending.lsulp.toString(),
          weftFinanceXrd: weftFinanceLending.xrd.toString(),
          weftFinanceLsulp: weftFinanceLending.lsulp.toString(),
          caviarNineXrd: caviarNine.xrd.toString(),
        };

        const usdValue = yield* getUsdValueService({
          timestamp: input.timestamp,
          resourceAddress: Assets.Fungible.XRD,
          amount: xrd
            .plus(stakedXrd)
            .plus(unstakedXrd)
            .plus(lsulp)
            .plus(rootFinanceLending.xrd)
            .plus(
              rootFinanceLending.lsulp.multipliedBy(
                input.accountBalance.lsulp.lsulpValue
              )
            )
            .plus(weftFinanceLending.xrd)
            .plus(
              weftFinanceLending.lsulp.multipliedBy(
                input.accountBalance.lsulp.lsulpValue
              )
            )
            .plus(caviarNine.xrd),
        });

        return [
          {
            timestamp: input.timestamp,
            address: input.accountBalance.address,
            activityId: "maintainXrdBalance",
            usdValue: usdValue,
            data,
          },
        ];
      });
  })
);

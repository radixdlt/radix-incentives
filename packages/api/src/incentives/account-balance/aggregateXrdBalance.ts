import { Effect, Layer } from "effect";
import type { AccountBalance } from "./getAccountBalancesAtStateVersion";
import { Context } from "effect";
import { Assets } from "../../common/assets/constants";

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
    xrdPrice: string;
    // staked: string;
    // lsulp: BigNumber;
    // unstaked: BigNumber;
    // staked: BigNumber;
    // weftXrd: BigNumber;
    // rootXrd: BigNumber;
    // rootLsulp: BigNumber;
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


export class XrdBalanceService extends Context.Tag(
    "XrdBalanceService"
)<
    XrdBalanceService,
    (
        input: XrdBalanceInput
    ) => Effect.Effect<
        XrdBalanceOutput[],
        InvalidResourceAddressError | PriceServiceApiError,
        GetUsdValueService
    >
>() { }

export const XrdBalanceLive = Layer.effect(
    XrdBalanceService,
    Effect.gen(function* () {
        const getUsdValueService = yield* GetUsdValueService;
        return (input) =>
            Effect.gen(function* () {
                const xrd = input.accountBalance.fungibleTokenBalances.find(
                    (resource) => resource.resourceAddress === Assets.Fungible.XRD
                )?.amount ?? new BigNumber(0);

                const stakedXrd = input.accountBalance.staked.reduce((acc, item) => acc.plus(item.xrdAmount), new BigNumber(0));
                const unstakedXrd = input.accountBalance.unstaked.reduce((acc, item) => acc.plus(item.amount), new BigNumber(0));
                // const lsulp = input.accountBalances.reduce((acc, item) => acc.plus(item.lsulp.amount), new BigNumber(0));
                // const unstaked = input.accountBalances.reduce((acc, item) => acc.plus(item.unstaked.reduce((acc, item) => acc.plus(item.amount), new BigNumber(0))), new BigNumber(0));
                // const staked = input.accountBalances.reduce((acc, item) => acc.plus(item.staked.reduce((acc, item) => acc.plus(item.amount), new BigNumber(0))), new BigNumber(0));
                // const weftXrd = input.accountBalances.reduce((acc, item) => acc.plus(item.weftFinancePositions.reduce((acc, item) => acc.plus(item.xrd), new BigNumber(0))), new BigNumber(0));
                const xrdPrice = yield* getUsdValueService({
                    timestamp: input.timestamp,
                    resourceAddress: Assets.Fungible.XRD,
                    amount: new BigNumber(1),
                });

                const data: XrdBalance = {
                    type: "maintainXrdBalance",
                    xrd : xrd.toString(),
                    stakedXrd: stakedXrd.toString(),
                    unstakedXrd: unstakedXrd.toString(),
                    xrdPrice: xrdPrice.toString(),
                    // lsulp,
                    // unstaked,
                    // staked,
                };

                const usdValue = yield* getUsdValueService({
                    timestamp: input.timestamp,
                    resourceAddress: Assets.Fungible.XRD,
                    amount: xrd,
                });

                const stakedUsdValue = yield* getUsdValueService({
                    timestamp: input.timestamp,
                    resourceAddress: Assets.Fungible.XRD,
                    amount: stakedXrd,
                });

                const unstakedUsdValue = yield* getUsdValueService({
                    timestamp: input.timestamp,
                    resourceAddress: Assets.Fungible.XRD,
                    amount: unstakedXrd,
                });

                const totalUsdValue = usdValue.plus(stakedUsdValue).plus(unstakedUsdValue);

                return [{
                    timestamp: input.timestamp,
                    address: input.accountBalance.address,
                    activityId: "maintainXrdBalance",
                    usdValue: totalUsdValue,
                    data,
                }];
            });
    })
);
import { z } from "zod";

export const ActivityCategoryKey = {
  maintainXrdBalance: "maintainXrdBalance",
  provideStablesLiquidityToDex: "provideStablesLiquidityToDex",
  lendingStables: "lendingStables",
  transactionFees: "transactionFees",
  componentCalls: "componentCalls",
  common: "common",
} as const;

export type ActivityCategoryKey = keyof typeof ActivityCategoryKey;

const testTokens = ["floop", "dfp2", "early", "caviar",
  "weft", "xUsdt", "root", "stab", "fusd", "popey", "radit", "dan", "hug",
  "surge", "sUsd", "delphi", "astrl", "ilis", "oci", "mox", "foton", "fomo",];
const tokens = ["xrd", "xusdc", "lsulp", "stakedXrd", "unstakedXrd",];

const allTokens = [...new Set([...testTokens, ...tokens]
  .filter(token => token !== "stakedXrd" && token !== "unstakedXrd"))];
export type Asset = typeof allTokens[number];

export type AssetPair = `${Asset}-${Asset}`;

export type DexDApp = "c9" | "defiPlaza" | "oci";
export type DexAction = "lp" | "trade";
export type DexActivityId = `${DexDApp}_${DexAction}_${AssetPair}`;

export type LendingDApp = "root" | "weft";
export type LendingAction = "lend";
export type LendingActivityId = `${LendingDApp}_${LendingAction}_${Asset}`;

export type MaintainXrdBalanceAction = "hold";
export type MaintainXrdBalanceAssets =
  | "xrd"
  | "stakedXrd"
  | "unstakedXrd"
  | "lsulp";
export type MaintainXrdBalanceActivityId =
  | `${DexDApp}_${MaintainXrdBalanceAction}_${AssetPair}`
  | `${LendingDApp}_${MaintainXrdBalanceAction}_${Asset}`
  | `${MaintainXrdBalanceAction}_${MaintainXrdBalanceAssets}`;

export type NetworkAction = "txFees" | "componentCalls";
export type NetworkActivityId = `${NetworkAction}`;

export type CommonAction = "common";
export type CommonActivityId = `${CommonAction}`;

export type ActivityId =
  | DexActivityId
  | LendingActivityId
  | MaintainXrdBalanceActivityId
  | NetworkActivityId
  | CommonActivityId;

export const AccountBalanceData = z.object({
  activityId: z.string(),
  usdValue: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type AccountBalanceData = Omit<
  z.infer<typeof AccountBalanceData>,
  "activityId"
> & {
  activityId: ActivityId;
};


export const activityCategoriesToSeed: { id: ActivityCategoryKey; name: string }[] = [
  {
    id: ActivityCategoryKey.maintainXrdBalance,
    name: "Maintain XRD balance",
  },
  {
    id: ActivityCategoryKey.provideStablesLiquidityToDex,
    name: "Provide stables liquidity to a DEX",
  },
  {
    id: ActivityCategoryKey.lendingStables,
    name: "Lend stables",
  },
  {
    id: ActivityCategoryKey.transactionFees,
    name: "Paid transaction fees",
  },
  {
    id: ActivityCategoryKey.common,
    name: "Common activities",
  },
];

import { z } from "zod";

export const ActivityCategoryKey = {
  maintainXrdBalance: "maintainXrdBalance",
  provideStablesLiquidityToDex: "provideStablesLiquidityToDex",
  lendingStables: "lendingStables",
  transactionFees: "transactionFees",
  componentCalls: "componentCalls",
  common: "common",
  tradingVolume: "tradingVolume",
} as const;

export type ActivityCategoryKey = keyof typeof ActivityCategoryKey;

export type Asset =
  | "xrd"
  | "xeth"
  | "xusdc"
  | "xusdt"
  | "xwbtc"
  | "lsulp"
  | "stakedXrd"
  | "unstakedXrd";
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

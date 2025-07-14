import { z } from "zod";

export const ActivityCategoryKey = {
  maintainXrdBalance: "maintainXrdBalance",
  provideStablesLiquidityToDex: "provideStablesLiquidityToDex",
  provideBlueChipLiquidityToDex: "provideBlueChipLiquidityToDex",
  provideNativeLiquidityToDex: "provideNativeLiquidityToDex",
  lendingStables: "lendingStables",
  lendingBlueChips: "lendingBlueChips",
  lendingNative: "lendingNative",
  transactionFees: "transactionFees",
  componentCalls: "componentCalls",
  common: "common",
  tradingVolume: "tradingVolume",
} as const;

export type ActivityCategoryKey = keyof typeof ActivityCategoryKey;

const testTokens = [
  "floop",
  "dfp2",
  "early",
  "caviar",
  "weft",
  "xUsdt",
  "root",
  "stab",
  "fusd",
  "popey",
  "radit",
  "dan",
  "hug",
  "surge",
  "sUsd",
  "delphi",
  "astrl",
  "ilis",
  "oci",
  "mox",
  "foton",
  "fomo",
];

// TODO: this seems double, together with address-validation and its token map.
// we might want to clean that up a bit
export const TOKENS = {
  xrd: "xrd",
  lsulp: "lsulp",
  stakedXrd: "stakedXrd",
  unstakedXrd: "unstakedXrd",

  astrl: "astrl",
  dfp2: "dfp2",
  ilis: "ilis",
  oci: "oci",
  early: "early",

  xeth: "xeth",
  xusdc: "xusdc",
  xusdt: "xusdt",
  xwbtc: "xwbtc",
} as const;
export type Token = keyof typeof TOKENS;

const tokens = Object.values(TOKENS) as Token[];

const allTokens = [
  ...new Set(
    [...testTokens, ...tokens].filter(
      (token) => token !== "stakedXrd" && token !== "unstakedXrd"
    )
  ),
];
export type Asset = (typeof allTokens)[number];

export type AssetPair = `${Asset}-${Asset}`;
export type SpecialCase = "hyperstake" | "xusdc";

export type DexDApp = "c9" | "defiPlaza" | "oci" | "surge";
export type DexAction = "lp" | "trade";
export type DexActivityId =
  | `${DexDApp}_${DexAction}_${AssetPair}`
  | `${DexDApp}_${DexAction}_${SpecialCase}`;

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

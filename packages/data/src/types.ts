import { z } from "zod";

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
  floop: "floop",
  reddicks: "reddicks",

  xeth: "xeth",
  xusdc: "xusdc",
  xusdt: "xusdt",
  xwbtc: "xwbtc",
  hyperstake: "hyperstake",
} as const;
export type Token = keyof typeof TOKENS;

const tokens = Object.values(TOKENS) as Token[];

const allTokens = [
  ...new Set(
    tokens.filter((token) => token !== "stakedXrd" && token !== "unstakedXrd")
  ),
];

export type TokenPair = `${Token}-${Token}`;
export type SpecialCase = "hyperstake" | "xusdc";

export type DexDApp = "c9" | "defiPlaza" | "oci" | "surge";
export type DexAction = "lp" | "nativeLp" | "trade";
export type DexActivityId =
  | `${DexDApp}_${DexAction}_${TokenPair}`
  | `${DexDApp}_${DexAction}_${SpecialCase}`;

export type LendingDApp = "root" | "weft";
export type LendingAction = "lend";
export type LendingActivityId = `${LendingDApp}_${LendingAction}_${Token}`;

export type MaintainXrdBalanceAction = "hold";
export type MaintainXrdBalanceAssets =
  | "xrd"
  | "stakedXrd"
  | "unstakedXrd"
  | "lsulp";
export type MaintainXrdBalanceActivityId =
  | `${DexDApp}_${MaintainXrdBalanceAction}_${TokenPair}`
  | `${LendingDApp}_${MaintainXrdBalanceAction}_${Token}`
  | `${MaintainXrdBalanceAction}_${MaintainXrdBalanceAssets}`;

export type NetworkAction = "txFees" | "componentCalls";
export type NetworkActivityId = `${NetworkAction}`;

export type CommonAction = "common";
export type CommonActivityId = `${CommonAction}`;

export type HoldHyperstakeAction = "c9_hold_hyperstake";

export type HoldStakedXrd = "weft_hold_stakedXrd";
export type HoldUnStakedXrd = "weft_hold_unstakedXrd";

export const AccountBalanceData = z.object({
  activityId: z.string(),
  usdValue: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  poolShare: z.record(z.string(), z.number()).optional(),
});

export type AccountBalanceData = Omit<
  z.infer<typeof AccountBalanceData>,
  "activityId"
> & {
  activityId: string;
};

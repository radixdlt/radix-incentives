export const ActivityCategoryId = {
  maintainXrdBalance: "maintainXrdBalance",
  provideStablesLiquidityToDex: "provideStablesLiquidityToDex",
  provideBlueChipLiquidityToDex: "provideBlueChipLiquidityToDex",
  provideNativeLiquidityToDex: "provideNativeLiquidityToDex",
  lendingStables: "lendingStables",
  lendingBlueChips: "lendingBlueChips",
  lendingNative: "lendingNative",
  transactionFees: "transactionFees",
  componentCalls: "componentCalls",
  tradingVolume: "tradingVolume",
  common: "common",
} as const;

export type ActivityCategoryId = keyof typeof ActivityCategoryId;

export const activityCategoriesData: {
  id: ActivityCategoryId;
  name: string;
}[] = [
  {
    id: ActivityCategoryId.maintainXrdBalance,
    name: "Maintain XRD balance",
  },
  {
    id: ActivityCategoryId.provideStablesLiquidityToDex,
    name: "Provide stables liquidity to a DEX",
  },
  {
    id: ActivityCategoryId.provideBlueChipLiquidityToDex,
    name: "Provide blue chip liquidity to a DEX",
  },
  {
    id: ActivityCategoryId.provideNativeLiquidityToDex,
    name: "Provide native liquidity to a DEX",
  },
  {
    id: ActivityCategoryId.lendingStables,
    name: "Lend stables",
  },
  {
    id: ActivityCategoryId.transactionFees,
    name: "Paid transaction fees",
  },
  {
    id: ActivityCategoryId.componentCalls,
    name: "Component calls",
  },
  {
    id: ActivityCategoryId.tradingVolume,
    name: "Trading volume",
  },
  {
    id: ActivityCategoryId.common,
    name: "Common activities",
  },
];

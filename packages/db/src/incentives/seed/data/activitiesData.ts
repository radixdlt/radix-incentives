import { ActivityCategoryKey } from "../../types";

export const activitiesData =  [
    // DEX activities
    {
      id: "c9_lp_xrd-xusdc",
      category: ActivityCategoryKey.provideStablesLiquidityToDex,
    },
    {
      id: "defiPlaza_lp_xrd-xusdc",
      category: ActivityCategoryKey.provideStablesLiquidityToDex,
    },
  
    // Lending activities
    {
      id: "root_lend_xusdc",
      category: ActivityCategoryKey.lendingStables,
    },
    {
      id: "weft_lend_xusdc",
      category: ActivityCategoryKey.lendingStables,
    },
  
    // Network activities
    {
      id: "txFees",
      category: ActivityCategoryKey.transactionFees,
    },
  
    // Season multiplier Hodl XRD activities for native assets
    {
      id: "hold_xrd",
      category: ActivityCategoryKey.maintainXrdBalance,
    },
    {
      id: "hold_stakedXrd",
      category: ActivityCategoryKey.maintainXrdBalance,
    },
    {
      id: "hold_unstakedXrd",
      category: ActivityCategoryKey.maintainXrdBalance,
    },
    {
      id: "hold_lsulp",
      category: ActivityCategoryKey.maintainXrdBalance,
    },
  
    // Season multiplier Hodl XRD activities through DEX LP positions
    {
      id: "c9_hold_xrd-xusdc",
      category: ActivityCategoryKey.maintainXrdBalance,
    },
    {
      id: "defiPlaza_hold_xrd-xusdc",
      category: ActivityCategoryKey.maintainXrdBalance,
    },
  
    // Season multiplier Hodl activities XRD activities through lending positions
    {
      id: "root_hold_xrd",
      category: ActivityCategoryKey.maintainXrdBalance,
    },
    {
      id: "root_hold_lsulp",
      category: ActivityCategoryKey.maintainXrdBalance,
    },
    {
      id: "weft_hold_xrd",
      category: ActivityCategoryKey.maintainXrdBalance,
    },
    {
      id: "weft_hold_lsulp",
      category: ActivityCategoryKey.maintainXrdBalance,
    },
    {
      id: "componentCalls",
      category: ActivityCategoryKey.componentCalls,
    },
  
    // Common activities, such as withdrawals and deposits
    {
      id: "common",
      category: ActivityCategoryKey.common,
    },
  ]
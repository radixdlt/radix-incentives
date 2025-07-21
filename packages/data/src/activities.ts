import { ActivityCategoryId } from "./activityCategories";
import type { ActivityId } from "./activityId";
import { DappId } from "./dapps/dapps";

export const activitiesData: {
  id: ActivityId;
  category: ActivityCategoryId;
  dApp: DappId;
}[] = [
  // DEX activities stables
  {
    id: "c9_lp_xrd-xusdc",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.caviarnine,
  },
  {
    id: "defiPlaza_lp_xrd-xusdc",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.defiPlaza,
  },
  {
    id: "oci_lp_xrd-xusdc",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.ociswap,
  },

  {
    id: "c9_lp_xrd-xusdt",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.caviarnine,
  },
  {
    id: "defiPlaza_lp_xrd-xusdt",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.defiPlaza,
  },
  {
    id: "oci_lp_xrd-xusdt",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.ociswap,
  },
  {
    id: "surge_lp_xusdc",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.surge,
  },

  // DEX blue chip LP activities
  {
    id: "c9_lp_xeth-xrd",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.caviarnine,
  },
  {
    id: "oci_lp_xeth-xrd",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.ociswap,
  },
  {
    id: "c9_lp_xrd-xwbtc",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.caviarnine,
  },
  {
    id: "oci_lp_xrd-xwbtc",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.ociswap,
  },
  {
    id: "defiPlaza_lp_xeth-xrd",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.defiPlaza,
  },
  {
    id: "defiPlaza_lp_xrd-xwbtc",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.defiPlaza,
  },

  // DEX native LP activities
  {
    id: "c9_nativeLp_lsulp-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_nativeLp_hyperstake",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_nativeLp_lsulp-reddicks",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_nativeLp_floop-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.caviarnine,
  },
  {
    id: "oci_nativeLp_oci-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.ociswap,
  },
  {
    id: "oci_nativeLp_ilis-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.ociswap,
  },
  {
    id: "oci_nativeLp_early-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.ociswap,
  },
  {
    id: "defiPlaza_nativeLp_astrl-dfp2",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.defiPlaza,
  },
  {
    id: "defiPlaza_nativeLp_dfp2-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.defiPlaza,
  },

  // Lending activities
  {
    id: "root_lend_xusdc",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.root,
  },
  {
    id: "weft_lend_xusdc",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.weft,
  },
  {
    id: "weft_lend_xusdt",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.weft,
  },
  {
    id: "weft_lend_xwbtc",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.weft,
  },
  {
    id: "weft_lend_xeth",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.weft,
  },
  {
    id: "weft_lend_xrd",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.weft,
  },
  {
    id: "root_lend_xusdt",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.root,
  },
  {
    id: "root_lend_xwbtc",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.root,
  },
  {
    id: "root_lend_xeth",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.root,
  },
  {
    id: "root_lend_xrd",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.root,
  },
  {
    id: "root_lend_lsulp",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.root,
  },

  // Network activities
  {
    id: "txFees",
    category: ActivityCategoryId.transactionFees,
    dApp: DappId.radix,
  },

  // Season multiplier Hodl XRD activities for native assets
  {
    id: "hold_xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.radix,
  },
  {
    id: "hold_stakedXrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.radix,
  },
  {
    id: "hold_unstakedXrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.radix,
  },
  {
    id: "hold_lsulp",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.radix,
  },

  // Season multiplier Hodl XRD activities through DEX LP positions
  {
    id: "c9_hold_xrd-xusdc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
  },
  {
    id: "defiPlaza_hold_xrd-xusdc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
  },
  {
    id: "oci_hold_xrd-xusdc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
  },
  {
    id: "c9_hold_xrd-xusdt",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
  },
  {
    id: "defiPlaza_hold_xrd-xusdt",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
  },
  {
    id: "oci_hold_xrd-xusdt",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
  },
  {
    id: "c9_hold_xeth-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
  },
  {
    id: "defiPlaza_hold_xeth-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
  },
  {
    id: "oci_hold_xeth-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
  },
  {
    id: "c9_hold_xrd-xwbtc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
  },
  {
    id: "defiPlaza_hold_xrd-xwbtc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
  },
  {
    id: "oci_hold_xrd-xwbtc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
  },
  {
    id: "c9_hold_lsulp-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_hold_hyperstake",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
  },
  {
    id: "oci_hold_early-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
  },
  {
    id: "oci_hold_ilis-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
  },
  {
    id: "oci_hold_oci-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
  },
  {
    id: "defiPlaza_hold_astrl-dfp2",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
  },
  {
    id: "defiPlaza_hold_dfp2-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
  },
  {
    id: "c9_hold_floop-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_hold_lsulp-reddicks",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
  },

  // Season multiplier Hodl activities XRD activities through lending positions
  {
    id: "root_hold_xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.root,
  },
  {
    id: "root_hold_lsulp",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.root,
  },
  {
    id: "weft_hold_xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.weft,
  },
  {
    id: "weft_hold_lsulp",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.weft,
  },
  {
    id: "weft_hold_stakedXrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.weft,
  },
  {
    id: "weft_hold_unstakedXrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.weft,
  },
  {
    id: "componentCalls",
    category: ActivityCategoryId.componentCalls,
    dApp: DappId.radix,
  },

  // Common activities, such as withdrawals and deposits
  {
    id: "common",
    category: ActivityCategoryId.common,
    dApp: DappId.radix,
  },
  // DEX trading activities
  {
    id: "c9_trade_xrd-xusdc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_trade_xrd-xusdt",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_trade_xeth-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_trade_xrd-xwbtc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_trade_lsulp-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_trade_hyperstake",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
  },
  {
    id: "defiPlaza_trade_xrd-xusdc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
  },
  {
    id: "defiPlaza_trade_xeth-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
  },
  {
    id: "defiPlaza_trade_xrd-xwbtc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
  },
  {
    id: "defiPlaza_trade_xrd-xusdt",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
  },
  {
    id: "oci_trade_xrd-xusdc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
  },
  {
    id: "oci_trade_xrd-xusdt",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
  },
  {
    id: "oci_trade_xeth-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
  },
  {
    id: "oci_trade_xrd-xwbtc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
  },
  {
    id: "c9_trade_lsulp-reddicks",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
  },
  {
    id: "c9_trade_floop-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
  },
  {
    id: "oci_trade_oci-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
  },
  {
    id: "oci_trade_ilis-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
  },
  {
    id: "oci_trade_early-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
  },
  {
    id: "defiPlaza_trade_astrl-dfp2",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
  },
  {
    id: "defiPlaza_trade_dfp2-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
  },
];

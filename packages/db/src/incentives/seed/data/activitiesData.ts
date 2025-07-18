import { ActivityCategoryKey, type Token } from "../../types";

const getPair = (token1: Token, token2: Token) => {
  // Sort tokens in ascending alphabetical order
  const [firstToken, secondToken] = [token1, token2].sort((a, b) =>
    a.localeCompare(b)
  );
  return `${firstToken}-${secondToken}`;
};

export const activitiesData = [
  // DEX activities stables
  {
    id: `c9_lp_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.provideStablesLiquidityToDex,
  },
  {
    id: `defiPlaza_lp_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.provideStablesLiquidityToDex,
  },
  {
    id: `oci_lp_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.provideStablesLiquidityToDex,
  },

  {
    id: `c9_lp_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.provideStablesLiquidityToDex,
  },
  {
    id: `defiPlaza_lp_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.provideStablesLiquidityToDex,
  },
  {
    id: `oci_lp_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.provideStablesLiquidityToDex,
  },
  {
    id: "surge_lp_xusdc",
    category: ActivityCategoryKey.provideStablesLiquidityToDex,
  },

  // DEX blue chip LP activities
  {
    id: `c9_lp_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.provideBlueChipLiquidityToDex,
  },
  {
    id: `oci_lp_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.provideBlueChipLiquidityToDex,
  },
  {
    id: `c9_lp_${getPair("xwbtc", "xrd")}`,
    category: ActivityCategoryKey.provideBlueChipLiquidityToDex,
  },
  {
    id: `oci_lp_${getPair("xwbtc", "xrd")}`,
    category: ActivityCategoryKey.provideBlueChipLiquidityToDex,
  },
  {
    id: `defiPlaza_lp_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.provideBlueChipLiquidityToDex,
  },
  {
    id: `defiPlaza_lp_${getPair("xrd", "xwbtc")}`,
    category: ActivityCategoryKey.provideBlueChipLiquidityToDex,
  },

  // DEX native LP activities
  {
    id: `c9_lp_${getPair("lsulp", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: "c9_lp_hyperstake",
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `c9_lp_${getPair("reddicks", "lsulp")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `c9_lp_${getPair("floop", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `oci_lp_${getPair("oci", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `oci_lp_${getPair("ilis", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `oci_lp_${getPair("early", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `defiPlaza_lp_${getPair("astrl", "dfp2")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `defiPlaza_lp_${getPair("xrd", "dfp2")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },

  // New nativeLp activities for stables
  {
    id: `c9_nativeLp_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `defiPlaza_nativeLp_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `oci_nativeLp_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `c9_nativeLp_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `defiPlaza_nativeLp_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `oci_nativeLp_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },

  // New nativeLp activities for blue chips
  {
    id: `c9_nativeLp_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `oci_nativeLp_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `c9_nativeLp_${getPair("xwbtc", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `oci_nativeLp_${getPair("xwbtc", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `defiPlaza_nativeLp_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `defiPlaza_nativeLp_${getPair("xrd", "xwbtc")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },

  // New nativeLp activities for native assets
  {
    id: `c9_nativeLp_${getPair("lsulp", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: "c9_nativeLp_hyperstake",
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `c9_nativeLp_${getPair("reddicks", "lsulp")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `c9_nativeLp_${getPair("floop", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `oci_nativeLp_${getPair("oci", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `oci_nativeLp_${getPair("ilis", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `oci_nativeLp_${getPair("early", "xrd")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `defiPlaza_nativeLp_${getPair("astrl", "dfp2")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
  },
  {
    id: `defiPlaza_nativeLp_${getPair("xrd", "dfp2")}`,
    category: ActivityCategoryKey.provideNativeLiquidityToDex,
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
  {
    id: "weft_lend_xusdt",
    category: ActivityCategoryKey.lendingStables,
  },
  {
    id: "weft_lend_xwbtc",
    category: ActivityCategoryKey.lendingStables,
  },
  {
    id: "weft_lend_xeth",
    category: ActivityCategoryKey.lendingStables,
  },
  {
    id: "weft_lend_xrd",
    category: ActivityCategoryKey.lendingStables,
  },
  {
    id: "root_lend_xusdt",
    category: ActivityCategoryKey.lendingStables,
  },
  {
    id: "root_lend_xwbtc",
    category: ActivityCategoryKey.lendingStables,
  },
  {
    id: "root_lend_xeth",
    category: ActivityCategoryKey.lendingStables,
  },
  {
    id: "root_lend_xrd",
    category: ActivityCategoryKey.lendingStables,
  },
  {
    id: "root_lend_lsulp",
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
    id: `c9_hold_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `defiPlaza_hold_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `oci_hold_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `c9_hold_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `defiPlaza_hold_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `oci_hold_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `c9_hold_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `defiPlaza_hold_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `oci_hold_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `c9_hold_${getPair("xrd", "xwbtc")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `defiPlaza_hold_${getPair("xrd", "xwbtc")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `oci_hold_${getPair("xrd", "xwbtc")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `c9_hold_${getPair("xrd", "lsulp")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: "c9_hold_hyperstake",
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `oci_hold_${getPair("early", "xrd")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `oci_hold_${getPair("ilis", "xrd")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `oci_hold_${getPair("oci", "xrd")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `defiPlaza_hold_${getPair("dfp2", "astrl")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `defiPlaza_hold_${getPair("dfp2", "xrd")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `c9_hold_${getPair("floop", "xrd")}`,
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: `c9_hold_${getPair("reddicks", "lsulp")}`,
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
    id: "weft_hold_stakedXrd",
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: "weft_hold_unstakedXrd",
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
  // DEX trading activities
  {
    id: `c9_trade_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `c9_trade_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `c9_trade_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `c9_trade_${getPair("xrd", "xwbtc")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `c9_trade_${getPair("xrd", "lsulp")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: "c9_trade_hyperstake",
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `defiPlaza_trade_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `defiPlaza_trade_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `defiPlaza_trade_${getPair("xrd", "xwbtc")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `defiPlaza_trade_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `oci_trade_${getPair("xrd", "xusdc")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `oci_trade_${getPair("xrd", "xusdt")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `oci_trade_${getPair("xrd", "xeth")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `oci_trade_${getPair("xrd", "xwbtc")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `c9_trade_${getPair("reddicks", "lsulp")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `c9_trade_${getPair("floop", "xrd")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `oci_trade_${getPair("oci", "xrd")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `oci_trade_${getPair("ilis", "xrd")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `oci_trade_${getPair("early", "xrd")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `defiPlaza_trade_${getPair("astrl", "dfp2")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
  {
    id: `defiPlaza_trade_${getPair("xrd", "dfp2")}`,
    category: ActivityCategoryKey.tradingVolume,
  },
];

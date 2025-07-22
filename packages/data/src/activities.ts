import { ActivityCategoryId } from "./activityCategories";
import type { ActivityId } from "./activityId";
import { CaviarNineConstants } from "./dapps/caviarnine/constants";
import { DappId } from "./dapps/dapps";
import { DefiPlazaConstants } from "./dapps/defiPlaza/constants";
import { OciswapConstants } from "./dapps/ociswap/constants";

import { SurgeConstants } from "./dapps/surge/constants";

export const activitiesData: {
  id: ActivityId;
  category: ActivityCategoryId;
  dApp: DappId;
  componentAddresses?: string[];
}[] = [
  /**
   * CaviarNine LP activities
   */
  {
    id: "c9_lp_xrd-xusdc",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.XRD_xUSDC.componentAddress,
    ],
  },
  {
    id: "c9_lp_xrd-xusdt",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.XRD_xUSDT.componentAddress,
    ],
  },
  {
    id: "c9_lp_xeth-xrd",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.xETH_XRD.componentAddress,
    ],
  },
  {
    id: "c9_lp_xrd-xwbtc",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.xwBTC_XRD.componentAddress,
    ],
  },
  /**
   * CaviarNine native LP activities
   */
  {
    id: "c9_nativeLp_lsulp-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.LSULP_XRD.componentAddress,
    ],
  },
  {
    id: "c9_nativeLp_hyperstake",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.caviarnine,
    componentAddresses: [CaviarNineConstants.HLP.componentAddress],
  },
  {
    id: "c9_nativeLp_lsulp-reddicks",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.simplePools.REDDICKS_LSULP.componentAddress,
    ],
  },
  {
    id: "c9_nativeLp_floop-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.simplePools.FLOOP_XRD.componentAddress,
    ],
  },

  /**
   * DefiPlaza LP activities
   */
  {
    id: "defiPlaza_lp_xrd-xusdc",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xUSDCPool.componentAddress],
  },
  {
    id: "defiPlaza_lp_xrd-xusdt",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xUSDTPool.componentAddress],
  },
  {
    id: "defiPlaza_lp_xeth-xrd",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xETHPool.componentAddress],
  },
  {
    id: "defiPlaza_lp_xrd-xwbtc",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xwBTCPool.componentAddress],
  },
  /**
   * DefiPlaza native LP activities
   */
  {
    id: "defiPlaza_nativeLp_astrl-dfp2",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.ASTRLPool.componentAddress],
  },

  /**
   * Ociswap LP activities
   */
  {
    id: "oci_lp_xrd-xusdc",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xUSDC_XRD.componentAddress],
  },
  {
    id: "oci_lp_xrd-xusdt",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xUSDT_XRD.componentAddress],
  },
  {
    id: "oci_lp_xeth-xrd",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xETH_XRD.componentAddress],
  },
  {
    id: "oci_lp_xrd-xwbtc",
    category: ActivityCategoryId.provideBlueChipLiquidityToDex,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xwBTC_XRD.componentAddress],
  },

  /**
   * Ociswap native LP activities
   */
  {
    id: "oci_nativeLp_oci-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.basicPools.OCI_XRD.componentAddress],
  },
  {
    id: "oci_nativeLp_ilis-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.flexPools.ILIS_XRD.componentAddress],
  },
  {
    id: "oci_nativeLp_early-xrd",
    category: ActivityCategoryId.provideNativeLiquidityToDex,
    dApp: DappId.ociswap,
    componentAddresses: [
      OciswapConstants.basicPools.EARLY_XRD.componentAddress,
    ],
  },

  /**
   * Surge LP activities
   */
  {
    id: "surge_lp_xusdc",
    category: ActivityCategoryId.provideStablesLiquidityToDex,
    dApp: DappId.surge,
    componentAddresses: [SurgeConstants.marginPool.componentAddress],
  },

  /**
   * Root lending activities
   */
  {
    id: "root_lend_xusdc",
    category: ActivityCategoryId.lendingStables,
    dApp: DappId.root,
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

  /**
   * Weft lending activities
   */
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

  /**
   * Network activities
   */
  {
    id: "txFees",
    category: ActivityCategoryId.transactionFees,
    dApp: DappId.radix,
  },

  /**
   * Radix hold activities
   */
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

  /**
   * CaviarNine hold activities
   */
  {
    id: "c9_hold_xrd-xusdc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.XRD_xUSDC.componentAddress,
    ],
  },
  {
    id: "c9_hold_xrd-xusdt",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.XRD_xUSDT.componentAddress,
    ],
  },
  {
    id: "c9_hold_xeth-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.xETH_XRD.componentAddress,
    ],
  },
  {
    id: "c9_hold_xrd-xwbtc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.xwBTC_XRD.componentAddress,
    ],
  },
  {
    id: "c9_hold_lsulp-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.LSULP_XRD.componentAddress,
    ],
  },
  {
    id: "c9_hold_hyperstake",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
    componentAddresses: [CaviarNineConstants.HLP.componentAddress],
  },
  {
    id: "c9_hold_floop-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.simplePools.FLOOP_XRD.componentAddress,
    ],
  },
  {
    id: "c9_hold_lsulp-reddicks",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.simplePools.REDDICKS_LSULP.componentAddress,
    ],
  },

  /**
   * DefiPlaza hold activities
   */
  {
    id: "defiPlaza_hold_xrd-xusdc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xUSDCPool.componentAddress],
  },
  {
    id: "defiPlaza_hold_xrd-xusdt",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xUSDTPool.componentAddress],
  },
  {
    id: "defiPlaza_hold_xeth-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xETHPool.componentAddress],
  },
  {
    id: "defiPlaza_hold_xrd-xwbtc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xwBTCPool.componentAddress],
  },
  {
    id: "defiPlaza_hold_astrl-dfp2",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.ASTRLPool.componentAddress],
  },
  {
    id: "defiPlaza_hold_dfp2-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.XRDPool.componentAddress],
  },

  /**
   * Ociswap hold activities
   */
  {
    id: "oci_hold_xrd-xusdc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xUSDC_XRD.componentAddress],
  },
  {
    id: "oci_hold_xrd-xusdt",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xUSDT_XRD.componentAddress],
  },
  {
    id: "oci_hold_xeth-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xETH_XRD.componentAddress],
  },
  {
    id: "oci_hold_xrd-xwbtc",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xwBTC_XRD.componentAddress],
  },
  {
    id: "oci_hold_early-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
    componentAddresses: [
      OciswapConstants.basicPools.EARLY_XRD.componentAddress,
    ],
  },
  {
    id: "oci_hold_ilis-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.flexPools.ILIS_XRD.componentAddress],
  },
  {
    id: "oci_hold_oci-xrd",
    category: ActivityCategoryId.maintainXrdBalance,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.basicPools.OCI_XRD.componentAddress],
  },

  /**
   * Root hold activities
   */
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

  /**
   * Weft hold activities
   */
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

  /**
   * CaviarNine trading activities
   */
  {
    id: "c9_trade_xrd-xusdc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.XRD_xUSDC.componentAddress,
    ],
  },
  {
    id: "c9_trade_xrd-xusdt",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.XRD_xUSDT.componentAddress,
    ],
  },
  {
    id: "c9_trade_xeth-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.xETH_XRD.componentAddress,
    ],
  },
  {
    id: "c9_trade_xrd-xwbtc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.xwBTC_XRD.componentAddress,
    ],
  },
  {
    id: "c9_trade_lsulp-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.shapeLiquidityPools.LSULP_XRD.componentAddress,
    ],
  },
  {
    id: "c9_trade_hyperstake",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
    componentAddresses: [CaviarNineConstants.HLP.componentAddress],
  },
  {
    id: "c9_trade_lsulp-reddicks",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.simplePools.REDDICKS_LSULP.componentAddress,
    ],
  },
  {
    id: "c9_trade_floop-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.caviarnine,
    componentAddresses: [
      CaviarNineConstants.simplePools.FLOOP_XRD.componentAddress,
    ],
  },

  /**
   * DefiPlaza trading activities
   */
  {
    id: "defiPlaza_trade_xrd-xusdc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xUSDCPool.componentAddress],
  },
  {
    id: "defiPlaza_trade_xeth-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xETHPool.componentAddress],
  },
  {
    id: "defiPlaza_trade_xrd-xwbtc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xwBTCPool.componentAddress],
  },
  {
    id: "defiPlaza_trade_xrd-xusdt",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.xUSDTPool.componentAddress],
  },
  {
    id: "defiPlaza_trade_astrl-dfp2",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.ASTRLPool.componentAddress],
  },
  {
    id: "defiPlaza_trade_dfp2-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.defiPlaza,
    componentAddresses: [DefiPlazaConstants.XRDPool.componentAddress],
  },

  /**
   * Ociswap trading activities
   */
  {
    id: "oci_trade_xrd-xusdt",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xUSDT_XRD.componentAddress],
  },
  {
    id: "oci_trade_xeth-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xETH_XRD.componentAddress],
  },
  {
    id: "oci_trade_xrd-xwbtc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xwBTC_XRD.componentAddress],
  },
  {
    id: "oci_trade_oci-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.basicPools.OCI_XRD.componentAddress],
  },
  {
    id: "oci_trade_ilis-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.flexPools.ILIS_XRD.componentAddress],
  },
  {
    id: "oci_trade_early-xrd",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
    componentAddresses: [
      OciswapConstants.basicPools.EARLY_XRD.componentAddress,
    ],
  },
  {
    id: "oci_trade_xrd-xusdc",
    category: ActivityCategoryId.tradingVolume,
    dApp: DappId.ociswap,
    componentAddresses: [OciswapConstants.pools.xUSDC_XRD.componentAddress],
  },

  /**
   * Component calls
   */
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
];

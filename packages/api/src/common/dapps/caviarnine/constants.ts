import { Assets } from "../../assets/constants";

export type ShapeLiquidityPool =
  (typeof CaviarNineConstants.shapeLiquidityPools)[keyof typeof CaviarNineConstants.shapeLiquidityPools];

export const CaviarNineConstants = {
  LSULP: {
    component:
      "component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp",
    resourceAddress:
      "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf",
  },
  shapeLiquidityPools: {
    LSULP_XRD: {
      name: "LSULP/XRD",
      componentAddress:
        "component_rdx1crdhl7gel57erzgpdz3l3vr64scslq4z7vd0xgna6vh5fq5fnn9xas",
      token_x:
        "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf",
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        "resource_rdx1ntrysy2sncpj6t6shjlgsfr55dns9290e2zsy67fwwrp6mywsrrgsc",
    },
    xwBTC_XRD: {
      name: "xwBTC/XRD",
      componentAddress:
        "component_rdx1cpqj6t2q9unetgvsnfgcmep90fc9y99gzzd58tkslu2etq0r4xs6zm",
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        "resource_rdx1nfdteayvxl6425jc5x5xa0p440h6r2mr48mgtj58szujr5cvgnfmn9",
    },
    XRD_xUSDC: {
      name: "XRD/xUSDC",
      componentAddress:
        "component_rdx1cr6lxkr83gzhmyg4uxg49wkug5s4wwc3c7cgmhxuczxraa09a97wcu",
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDC,
      liquidity_receipt:
        "resource_rdx1ntzhjg985wgpkhda9f9q05xqdj8xuggfw0j5u3zxudk2csv82d0089",
    },
  },
} as const;

export const shapeLiquidityReceiptSet = new Map<string, ShapeLiquidityPool>(
  Object.values(CaviarNineConstants.shapeLiquidityPools).map((pool) => [
    pool.liquidity_receipt,
    pool,
  ])
);

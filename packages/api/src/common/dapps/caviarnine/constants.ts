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
  HLP: {
    resourceAddress:
      "resource_rdx1th0f0khh9g8hwa0qtxsarmq8y7yeekjnh4n74494d5zf4k5vw8qv6m",
    poolAddress:
      "pool_rdx1chmckjpr0ks5lk6h7mqvmrw56wt4w6tsuy6n2jhd8fhr8vc5en5e90",
    componentAddress:
      "component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf", //don't need to derive user's value, but important to check for SwapEvents!
    token_x:
      "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf",
    token_y: Assets.Fungible.XRD,
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
        "component_rdx1cp9w8443uyz2jtlaxnkcq84q5a5ndqpg05wgckzrnd3lgggpa080ed",
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
    xETH_XRD: {
      name: "xETH/XRD",
      componentAddress:
        "component_rdx1cpsvw207842gafeyvf6tc0gdnq47u3mn74kvzszqlhc03lrns52v82",
      token_x: Assets.Fungible.xETH,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        "resource_rdx1nthy5lna9l0tgtfxzxcrn6hmle0uymrutqwnlcj8tuujpz3s62wlc5",
    },
    XRD_xUSDT: {
      name: "XRD/xUSDT",
      componentAddress:
        "component_rdx1cqs338cyje65rk44zgmjvvy42qcszrhk9ewznedtkqd8l3crtgnmh5",
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDT,
      liquidity_receipt:
        "resource_rdx1nft63kjp38agw0z8nnwkyjhcgpzwjer84945h5z8yr663fgukjyp3l",
    },
  },
} as const;

export const shapeLiquidityReceiptSet = new Map<string, ShapeLiquidityPool>(
  Object.values(CaviarNineConstants.shapeLiquidityPools).map((pool) => [
    pool.liquidity_receipt,
    pool,
  ])
);

export const shapeLiquidityComponentSet = new Map<string, ShapeLiquidityPool>(
  Object.values(CaviarNineConstants.shapeLiquidityPools).map((pool) => [
    pool.componentAddress,
    pool,
  ])
);

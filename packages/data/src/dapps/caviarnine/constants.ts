import { Assets } from "../../assets";

export type ShapeLiquidityPool =
  (typeof CaviarNineConstants.shapeLiquidityPools)[keyof typeof CaviarNineConstants.shapeLiquidityPools];

export type SimplePool =
  (typeof CaviarNineConstants.simplePools)[keyof typeof CaviarNineConstants.simplePools];

export const CaviarNineConstants = {
  LSULP: {
    component:
      "component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp",
    resourceAddress: Assets.Fungible.LSULP,
  },
  HLP: {
    resourceAddress: Assets.Fungible.HLP,
    poolAddress:
      "pool_rdx1chmckjpr0ks5lk6h7mqvmrw56wt4w6tsuy6n2jhd8fhr8vc5en5e90",
    componentAddress:
      "component_rdx1cpz0zcyyl2fvtc5wdvfjjl3w0mjcydm4fefymudladklf6rn5gdwtf", //don't need to derive user's value, but important to check for SwapEvents!
    token_x: Assets.Fungible.HLP,
    token_y: Assets.Fungible.XRD,
  },
  shapeLiquidityPools: {
    LSULP_XRD: {
      name: "LSULP/XRD",
      componentAddress:
        "component_rdx1crdhl7gel57erzgpdz3l3vr64scslq4z7vd0xgna6vh5fq5fnn9xas",
      token_x: Assets.Fungible.LSULP,
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
    FLOOP_XRD: {
      name: "FLOOP/XRD",
      componentAddress:
        "component_rdx1czgaazn4wqf40kav57t8tu6kwv2a5sfmnlzlar9ee6kdqk0ll2chsz",
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.XRD,
      liquidity_receipt:
        "resource_rdx1ntpkcfe5ny37wk487ruuxj8wrgk6qg8rjq80m08un4yg98dmyj6msq",
    },
  },
  simplePools: {
    REDDICKS_LSULP: {
      name: "REDDICKS/LSULP",
      componentAddress:
        "component_rdx1cz7s2xn8ddpmgm3uw0ma4jhaxhxdwce253v9j5agvffhftny6rgh8n",
      poolAddress:
        "pool_rdx1chmx480a0crrnaqyg2e6tr7wtqwk5239grzs6ecckcmhqjm3gdmm73",
      lpResourceAddress:
        "resource_rdx1tkjspzkzmhyzxwcrjha3y2aapmg5690vayjehqtfa729jnr88hcaue",
      token_x: Assets.Fungible.REDDICKS,
      token_y: Assets.Fungible.LSULP,
    },
    FLOOP_XRD: {
      name: "FLOOP/XRD",
      componentAddress:
        "component_rdx1cpc6hjytxcvddl3e38u9amkn52ly3vzw6r0pxu54ge43l4ttw9ym7c",
      poolAddress:
        "pool_rdx1ch3vyhagpzqll4cu6quafdpkf7lvyuz7ke4z66tuqpxhvtxzd9lvmu",
      lpResourceAddress:
        "resource_rdx1th2pnc0lzgp20wwv2r22knjn32ntvecapws6v7z644c0d3rzz0fvng",
      token_x: Assets.Fungible.FLOOP,
      token_y: Assets.Fungible.XRD,
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

export const simplePoolComponentSet = new Map<string, SimplePool>(
  Object.values(CaviarNineConstants.simplePools).map((pool) => [
    pool.componentAddress,
    pool,
  ])
);

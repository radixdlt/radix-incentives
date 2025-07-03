import { Assets } from "../../assets/constants";

export const OciswapConstants = {
  pools: {
    xwBTC_XRD: {
      name: "xwBTC/XRD",
      componentAddress: "component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr",
      lpResourceAddress: "resource_rdx1n2zsvvdahtnlm53ms5f6zazjx6rnnmu2u6xjdr8ggzw45way0tefe6",
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.XRD,
    },
    xETH_XRD: {
      name: "xETH/XRD", 
      componentAddress: "component_rdx1crahf8qdh8fgm8mvzmq5w832h97q5099svufnqn26ue44fyezn7gnm",
      lpResourceAddress: "resource_rdx1nge9z3amafwyqvjzg5fzwk9m8dkcu584p6lcme7dx4p72x9xcaa3la",
      token_x: Assets.Fungible.xETH,
      token_y: Assets.Fungible.XRD,
    },
    xUSDC_XRD: {
      name: "xUSDC/XRD",
      componentAddress: "component_rdx1crahf8qdh8fgm8mvzmq5w832h97q5099svufnqn26ue44fyezn7gnm",
      lpResourceAddress: "resource_rdx1nflrqd24a8xqelasygwlt6dhrgtu3akky695kk6j3cy4wu0wfn2ef8",
      token_x: Assets.Fungible.xUSDC,
      token_y: Assets.Fungible.XRD,
    },
    xUSDT_XRD: {
      name: "xUSDT/XRD",
      componentAddress: "component_rdx1crahf8qdh8fgm8mvzmq5w832h97q5099svufnqn26ue44fyezn7gnm",
      lpResourceAddress: "resource_rdx1nffckx9ek5x5hn2cxj2hc0tk8yvwh6a2rh9jckgnwha7smry2rtr0a",
      token_x: Assets.Fungible.xUSDT,
      token_y: Assets.Fungible.XRD,
    },
  },
} as const;

export type OciswapPool = (typeof OciswapConstants.pools)[keyof typeof OciswapConstants.pools];

export const ociswapComponentSet = new Map<string, OciswapPool>(
  Object.values(OciswapConstants.pools).map((pool) => [
    pool.componentAddress,
    pool,
  ])
);
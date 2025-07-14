import { Assets } from "../../assets/constants";

export const OciswapConstants = {
  pools: {
    xwBTC_XRD: {
      name: "xwBTC/XRD",
      componentAddress:
        "component_rdx1cpgmgrskahkxe4lnpp9s2f5ga0z8jkl7ne8gjmw3fc2224lxq505mr",
      lpResourceAddress:
        "resource_rdx1n2zsvvdahtnlm53ms5f6zazjx6rnnmu2u6xjdr8ggzw45way0tefe6",
      token_x: Assets.Fungible.wxBTC,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 8,
      divisibility_y: 18,
    },
    xETH_XRD: {
      name: "xETH/XRD",
      componentAddress:
        "component_rdx1crahf8qdh8fgm8mvzmq5w832h97q5099svufnqn26ue44fyezn7gnm",
      lpResourceAddress:
        "resource_rdx1nge9z3amafwyqvjzg5fzwk9m8dkcu584p6lcme7dx4p72x9xcaa3la",
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xETH,
      divisibility_x: 18,
      divisibility_y: 18,
    },
    xUSDC_XRD: {
      name: "xUSDC/XRD",
      componentAddress:
        "component_rdx1cz8daq5nwmtdju4hj5rxud0ta26wf90sdk5r4nj9fqjcde5eht8p0f",
      lpResourceAddress:
        "resource_rdx1nflrqd24a8xqelasygwlt6dhrgtu3akky695kk6j3cy4wu0wfn2ef8",
      token_x: Assets.Fungible.xUSDC,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 6,
      divisibility_y: 18,
    },
    xUSDT_XRD: {
      name: "xUSDT/XRD",
      componentAddress:
        "component_rdx1cz79xc57dpuhzd3wylnc88m3pyvfk7c5e03me2qv7x8wh9t6c3aw4g",
      lpResourceAddress:
        "resource_rdx1nffckx9ek5x5hn2cxj2hc0tk8yvwh6a2rh9jckgnwha7smry2rtr0a",
      token_x: Assets.Fungible.XRD,
      token_y: Assets.Fungible.xUSDT,
      divisibility_x: 18,
      divisibility_y: 6,
    },
  },
  poolsV2: {
    OCI_XRD: {
      name: "OCI/XRD",
      componentAddress:
        "component_rdx1crm530ath85gcwm4gvwq8m70ay07df085kmupp6gte3ew94vg5pdcp",
      lpResourceAddress:
        "resource_rdx1n2qukjm07d26matv7cyc5ev2f942uy44zn9h3x7p8hnm9dah5flht4",
      token_x: Assets.Fungible.OCI,
      token_y: Assets.Fungible.XRD,
      divisibility_x: 18,
      divisibility_y: 18,
    },
  },
  basicPools: {
    EARLY_XRD: {
      name: "EARLY/XRD",
      componentAddress:
        "component_rdx1cz8p5lc8vmj96hdguy02hkfq4z5xyxf9k759dj8ym8exj8x8zgmw9p",
      poolAddress:
        "pool_rdx1c5hm2rt67scp22pq6tpkfg6cd22g0wwz88065wsy9gdfnd86sv3t4t",
      lpResourceAddress:
        "resource_rdx1t5362v5zqsfkfe38uyl368edpsdm23u5g69qt55jn0ye8nf6umnnv9",
      token_x: Assets.Fungible.EARLY,
      token_y: Assets.Fungible.XRD,
    },
  },
  flexPools: {
    ILIS_XRD: {
      name: "ILIS/XRD",
      componentAddress:
        "component_rdx1cr9tj8xd5cjs9mzkqdnamrzq0xgy4eylk75vhqqzka5uxsxatv4wxd",
      poolAddress:
        "pool_rdx1c5cyh7lhxly2mxzsmrs4c99vhxt9jzap3gaf7s8h0h68fqlpfht0un",
      lpResourceAddress:
        "resource_rdx1t4qxj7nnm0sra6f6j9jq73erd489hdad6jp92hggtfwgwy9p2mgn76",
      token_x: Assets.Fungible.ILIS,
      token_y: Assets.Fungible.XRD,
    },
  },
} as const;

export type OciswapPool =
  (typeof OciswapConstants.pools)[keyof typeof OciswapConstants.pools];

export type OciswapPoolV2 =
  (typeof OciswapConstants.poolsV2)[keyof typeof OciswapConstants.poolsV2];

export type AllOciswapPools = OciswapPool | OciswapPoolV2;

export const ociswapComponentSet = new Map<string, OciswapPool>(
  Object.values(OciswapConstants.pools).map((pool) => [
    pool.componentAddress,
    pool,
  ])
);

export const ociswapV2ComponentSet = new Map<string, OciswapPoolV2>(
  Object.values(OciswapConstants.poolsV2).map((pool) => [
    pool.componentAddress,
    pool,
  ])
);

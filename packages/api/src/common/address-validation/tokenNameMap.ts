import { Assets } from "../assets/constants";
import { CaviarNineConstants } from "../dapps/caviarnine/constants";

// Centralized token name mapping (consolidated from TokenNameService)
export const tokenNameMap = {
  [Assets.Fungible.XRD]: "xrd",
  [Assets.Fungible.xUSDC]: "xusdc",
  [Assets.Fungible.xUSDT]: "xusdt",
  [Assets.Fungible.wxBTC]: "xwbtc",
  [Assets.Fungible.xETH]: "xeth",
  [CaviarNineConstants.LSULP.resourceAddress]: "lsulp",
} as const;

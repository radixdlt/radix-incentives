import { Assets } from "../assets/constants";
import { CaviarNineConstants } from "../dapps/caviarnine/constants";

// Centralized token mapping with XRD derivative classification
export const tokenNameMap = {
  // XRD derivatives
  xrdDerivatives: {
    [Assets.Fungible.XRD]: "xrd",
    [CaviarNineConstants.LSULP.resourceAddress]: "lsulp",
    [Assets.Fungible.OCI]: "oci",
    [Assets.Fungible.EARLY]: "early",
    [Assets.Fungible.ILIS]: "ilis",
    [Assets.Fungible.DFP2]: "dfp2",
    [Assets.Fungible.ASTRL]: "astrl",
    [Assets.Fungible.FLOOP]: "floop",
    [Assets.Fungible.REDDICKS]: "reddicks",
  },
  // Non-XRD derivatives
  nonXrdDerivatives: {
    [Assets.Fungible.xUSDC]: "xusdc",
    [Assets.Fungible.xUSDT]: "xusdt",
    [Assets.Fungible.wxBTC]: "xwbtc",
    [Assets.Fungible.xETH]: "xeth",
  },
} as const;

export const flatTokenNameMap = {
  ...tokenNameMap.xrdDerivatives,
  ...tokenNameMap.nonXrdDerivatives,
} as const;

// A set of XRD derivatives for quick lookup
export const xrdDerivatives = new Set(Object.keys(tokenNameMap.xrdDerivatives));

export type TokenInfo = {
  name: string;
  isXrdDerivative: boolean;
};

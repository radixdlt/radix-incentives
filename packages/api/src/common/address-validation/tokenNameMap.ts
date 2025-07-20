import { Assets } from "../assets/constants";
import { CaviarNineConstants } from "../dapps/caviarnine/constants";

// Centralized token mapping with native and wrapped asset classification
export const tokenNameMap = {
  // Native Radix assets
  nativeAssets: {
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
  // Wrapped/bridged assets
  wrappedAssets: {
    [Assets.Fungible.xUSDC]: "xusdc",
    [Assets.Fungible.xUSDT]: "xusdt",
    [Assets.Fungible.wxBTC]: "xwbtc",
    [Assets.Fungible.xETH]: "xeth",
  },
} as const;

export const flatTokenNameMap = {
  ...tokenNameMap.nativeAssets,
  ...tokenNameMap.wrappedAssets,
} as const;

// A set of native assets for quick lookup
export const nativeAssets = new Set(Object.keys(tokenNameMap.nativeAssets));

// A set of XRD derivatives for quick lookup (subset of native assets, used in aggregateXrdBalances.ts)
export const xrdDerivatives = new Set([
  Assets.Fungible.XRD,
  CaviarNineConstants.LSULP.resourceAddress,
  // LSUs and unstaking receipts would be added here when needed
]);

export type TokenInfo = {
  name: string;
  isNativeAsset: boolean;
};

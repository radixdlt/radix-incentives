export const Assets = {
  Fungible: {
    XRD: "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",

    //wrapped instabridge
    wxBTC:
      "resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75",
    xUSDC:
      "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
    xETH: "resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww",
    xUSDT:
      "resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw",

    //ecosystem
    OCI: "resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8",
    EARLY:
      "resource_rdx1t5xv44c0u99z096q00mv74emwmxwjw26m98lwlzq6ddlpe9f5cuc7s",
    ILIS: "resource_rdx1t4r86qqjtzl8620ahvsxuxaf366s6rf6cpy24psdkmrlkdqvzn47c2",
    DFP2: "resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq",
    ASTRL:
      "resource_rdx1t4tjx4g3qzd98nayqxm7qdpj0a0u8ns6a0jrchq49dyfevgh6u0gj3",
    FLOOP:
      "resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9",
    REDDICKS:
      "resource_rdx1t42hpqvsk4t42l6aw09hwphd2axvetp6gvas9ztue0p30f4hzdwxrp",

    LSULP:
      "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf",
    HLP: "resource_rdx1th0f0khh9g8hwa0qtxsarmq8y7yeekjnh4n74494d5zf4k5vw8qv6m",
  },
} as const;

// Centralized token mapping with native and wrapped asset classification
export const tokenNameMap = {
  // Native Radix assets
  nativeAssets: {
    [Assets.Fungible.XRD]: "xrd",
    [Assets.Fungible.LSULP]: "lsulp",
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
  Assets.Fungible.LSULP,
  // LSUs and unstaking receipts would be added here when needed
]);

export type TokenInfo = {
  name: string;
  isNativeAsset: boolean;
};

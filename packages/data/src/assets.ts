export const Assets = {
  Fungible: {
    XRD: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',

    //wrapped instabridge
    wxBTC:
      'resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75',
    xUSDC:
      'resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf',
    xETH: 'resource_rdx1th88qcj5syl9ghka2g9l7tw497vy5x6zaatyvgfkwcfe8n9jt2npww',
    xUSDT:
      'resource_rdx1thrvr3xfs2tarm2dl9emvs26vjqxu6mqvfgvqjne940jv0lnrrg7rw',

    // wrapped stable
    sUSD: 'resource_rdx1th3uhn6905l2vh49z2d83xgr45a08dkxn8ajxmt824ctpdu69msp89',

    //ecosystem
    OCI: 'resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8',
    EARLY:
      'resource_rdx1t5xv44c0u99z096q00mv74emwmxwjw26m98lwlzq6ddlpe9f5cuc7s',
    ILIS: 'resource_rdx1t4r86qqjtzl8620ahvsxuxaf366s6rf6cpy24psdkmrlkdqvzn47c2',
    DFP2: 'resource_rdx1t5ywq4c6nd2lxkemkv4uzt8v7x7smjcguzq5sgafwtasa6luq7fclq',
    ASTRL:
      'resource_rdx1t4tjx4g3qzd98nayqxm7qdpj0a0u8ns6a0jrchq49dyfevgh6u0gj3',
    FLOOP:
      'resource_rdx1t5pyvlaas0ljxy0wytm5gvyamyv896m69njqdmm2stukr3xexc2up9',
    REDDICKS:
      'resource_rdx1t42hpqvsk4t42l6aw09hwphd2axvetp6gvas9ztue0p30f4hzdwxrp',

    LSULP:
      'resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf',
    HLP: 'resource_rdx1th0f0khh9g8hwa0qtxsarmq8y7yeekjnh4n74494d5zf4k5vw8qv6m',
    WEFT: 'resource_rdx1tk3fxrz75ghllrqhyq8e574rkf4lsq2x5a0vegxwlh3defv225cth3',
    hwBTC:
      'resource_rdx1t58kkcqdz0mavfz98m98qh9m4jexyl9tacsvlhns6yxs4r6hrm5re5',
    hETH: 'resource_rdx1th09yvv7tgsrv708ffsgqjjf2mhy84mscmj5jwu4g670fh3e5zgef0',
    hUSDC:
      'resource_rdx1thxj9m87sn5cc9ehgp9qxp6vzeqxtce90xm5cp33373tclyp4et4gv',
    hUSDT:
      'resource_rdx1th4v03gezwgzkuma6p38lnum8ww8t4ds9nvcrkr2p9ft6kxx3kxvhe',
  },
} as const;

// Centralized token mapping with native and wrapped asset classification
export const tokenNameMap = {
  xrdDerivativeAssets: {
    [Assets.Fungible.XRD]: 'xrd',
    [Assets.Fungible.LSULP]: 'lsulp',
    [Assets.Fungible.HLP]: 'hlp',
  },
  // Native Radix assets
  nativeAssets: {
    [Assets.Fungible.OCI]: 'oci',
    [Assets.Fungible.EARLY]: 'early',
    [Assets.Fungible.ILIS]: 'ilis',
    [Assets.Fungible.DFP2]: 'dfp2',
    [Assets.Fungible.ASTRL]: 'astrl',
    [Assets.Fungible.FLOOP]: 'floop',
    [Assets.Fungible.REDDICKS]: 'reddicks',
    [Assets.Fungible.WEFT]: 'weft',
  },
  // Wrapped/bridged assets
  bluechipAssets: {
    [Assets.Fungible.wxBTC]: 'xwbtc',
    [Assets.Fungible.xETH]: 'xeth',
    [Assets.Fungible.hwBTC]: 'hwbtc',
    [Assets.Fungible.hETH]: 'heth',
  },
  stableAssets: {
    [Assets.Fungible.xUSDC]: 'xusdc',
    [Assets.Fungible.xUSDT]: 'xusdt',
    [Assets.Fungible.sUSD]: 'susd',
    [Assets.Fungible.hUSDC]: 'husdc',
    [Assets.Fungible.hUSDT]: 'husdt',
  },
} as const;

export const flatTokenNameMap = {
  ...tokenNameMap.nativeAssets,
  ...tokenNameMap.bluechipAssets,
  ...tokenNameMap.stableAssets,
  ...tokenNameMap.xrdDerivativeAssets,
} as const;

export const AssetType = {
  XRD_DERIVATIVE: 'der',
  NATIVE: 'nat',
  BLUECHIP: 'blu',
  STABLE: 'sta',
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];

// A set of assets for quick lookup
export const nativeAssets = new Set(Object.keys(tokenNameMap.nativeAssets));
export const xrdDerivativeAssets = new Set(
  Object.keys(tokenNameMap.xrdDerivativeAssets),
);
export const bluechipAssets = new Set(Object.keys(tokenNameMap.bluechipAssets));
export const stableAssets = new Set(Object.keys(tokenNameMap.stableAssets));

export type TokenInfo = {
  name: string;
  isNativeAsset: boolean;
};

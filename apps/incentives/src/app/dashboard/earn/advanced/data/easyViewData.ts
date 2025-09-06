export interface DappLogo {
  name: string;
  logoPath: string;
  websiteUrl: string;
}

export interface EasyViewData {
  id: string;
  name: string;
  description: string;
  category: string;
  dapp: string;
  component_addresses: string;
  AP: boolean;
  multiplier: boolean;
  seasonPointsPerWeek?: number;
  dappLogos?: DappLogo[];
}

export const easyViewData: EasyViewData[] = [
  {
    id: 'ph_ho',
    name: 'XRD Points Multiplier',
    description:
      'Earn a bonus multiplier based on the XRD, LSUs, and supported pool positions you maintain in your wallet or across dApps. The more you hold, the higher your bonus!',
    category: 'maintainXrdBalance',
    dapp: '',
    component_addresses: '',
    AP: false,
    multiplier: true,
  },
  {
    id: 'ph_lp_blu',
    name: 'Add Bluechip DEX Liquidity',
    description:
      'Provide liquidity on DEXs with hwBTC, hETH, xwBTC, or xETH in supported pools on CaviarNine, Ociswap, and DeFiPlaza. Any XRD paired is included in multiplier.',
    category: 'provideBlueChipLiquidityToDex',
    dapp: '',
    component_addresses: '',
    AP: true,
    multiplier: false,
    seasonPointsPerWeek: 500000,
    dappLogos: [
      {
        name: 'CaviarNine',
        logoPath: '/caviarnine-logo.png',
        websiteUrl: 'https://www.caviarnine.com/',
      },
      {
        name: 'Ociswap',
        logoPath: '/ociswap-logo.jpg',
        websiteUrl: 'https://ociswap.com/',
      },
      {
        name: 'DeFiPlaza',
        logoPath: '/defiplaza-logo.jpg',
        websiteUrl: 'https://defiplaza.net/',
      },
    ],
  },
  {
    id: 'ph_lp_der',
    name: 'Add XRD / LSU DEX Liquidity',
    description:
      'Provide liquidity on DEXs with XRD or LSULP in supported pools on CaviarNine, Ociswap, and DeFiPlaza. This also counts for your multiplier!',
    category: 'provideXrdDerivativeLiquidityToDex',
    dapp: '',
    component_addresses: '',
    AP: true,
    multiplier: true,
    seasonPointsPerWeek: 100000,
    dappLogos: [
      {
        name: 'CaviarNine',
        logoPath: '/caviarnine-logo.png',
        websiteUrl: 'https://www.caviarnine.com/',
      },
      {
        name: 'Ociswap',
        logoPath: '/ociswap-logo.jpg',
        websiteUrl: 'https://ociswap.com/',
      },
      {
        name: 'DeFiPlaza',
        logoPath: '/defiplaza-logo.jpg',
        websiteUrl: 'https://defiplaza.net/',
      },
    ],
  },
  {
    id: 'ph_lp_nat',
    name: 'Add Radix Native Alts DEX Liquidity',
    description:
      'Provide liquidity on DEXs using ASTRL, DEP2, EARLY, FLOOP, ILIS, Reddicks, OCI, or WEFT in supported pools on CaviarNine, Ociswap, and DeFiPlaza. Any XRD paired is included in multiplier.',
    category: 'provideNativeLiquidityToDex',
    dapp: '',
    component_addresses: '',
    AP: true,
    multiplier: false,
    seasonPointsPerWeek: 100000,
    dappLogos: [
      {
        name: 'CaviarNine',
        logoPath: '/caviarnine-logo.png',
        websiteUrl: 'https://www.caviarnine.com/',
      },
      {
        name: 'Ociswap',
        logoPath: '/ociswap-logo.jpg',
        websiteUrl: 'https://ociswap.com/',
      },
      {
        name: 'DeFiPlaza',
        logoPath: '/defiplaza-logo.jpg',
        websiteUrl: 'https://defiplaza.net/',
      },
    ],
  },
  {
    id: 'ph_lp_sta',
    name: 'Add USDC/T DEX Liquidity',
    description:
      'Provide liquidity on DEXs using hUSDC, hUSDT, xUSDC, or xUSDT in supported pools on CaviarNine, Ociswap, and DeFiPlaza. Also includes xUSDC added to Surge LP. Any XRD paired is included in multiplier.',
    category: 'provideStablesLiquidityToDex',
    dapp: '',
    component_addresses: '',
    AP: true,
    multiplier: true,
    seasonPointsPerWeek: 500000,
    dappLogos: [
      {
        name: 'CaviarNine',
        logoPath: '/caviarnine-logo.png',
        websiteUrl: 'https://www.caviarnine.com/',
      },
      {
        name: 'Ociswap',
        logoPath: '/ociswap-logo.jpg',
        websiteUrl: 'https://ociswap.com/',
      },
      {
        name: 'DeFiPlaza',
        logoPath: '/defiplaza-logo.jpg',
        websiteUrl: 'https://defiplaza.net/',
      },
      {
        name: 'Surge',
        logoPath: '/surge-logo.png',
        websiteUrl: 'https://www.surge.trade/',
      },
    ],
  },
  {
    id: 'ph_tr',
    name: 'Trade on Radix DEXs',
    description:
      'Earn points by trading on Radix-based DEXs or aggregators on any asset supported in Radix Rewards. Higher trading volume gives you more rewards.',
    category: 'tradingVolume',
    dapp: '',
    component_addresses: '',
    AP: true,
    multiplier: false,
    seasonPointsPerWeek: 100000,
    dappLogos: [
      {
        name: 'CaviarNine',
        logoPath: '/caviarnine-logo.png',
        websiteUrl: 'https://www.caviarnine.com/',
      },
      {
        name: 'Ociswap',
        logoPath: '/ociswap-logo.jpg',
        websiteUrl: 'https://ociswap.com/',
      },
      {
        name: 'Astrolescent',
        logoPath: '/astrolescent-logo.png',
        websiteUrl: 'https://astrolescent.com/',
      },
    ],
  },
  {
    id: 'ph_compnentCall',
    name: 'Use any Radix dApp',
    description:
      'Engage with the Radix ecosystem by using dApps and interacting with their features. Each unique dApp you use each week earns points.',
    category: 'componentCalls',
    dapp: '',
    component_addresses: '',
    AP: true,
    multiplier: false,
    seasonPointsPerWeek: 100000,
  },
  {
    id: 'ph_le_blu',
    name: 'Lend Bluechip Assets',
    description: 'Lend hwBTC, hETH, xwBTC, or xETH on Root or WEFT.',
    category: 'lendingBlueChips',
    dapp: '',
    component_addresses: '',
    AP: true,
    multiplier: false,
    seasonPointsPerWeek: 500000,
    dappLogos: [
      {
        name: 'Root Finance',
        logoPath: '/root-logo.png',
        websiteUrl: 'https://rootfinance.xyz/',
      },
      {
        name: 'Weft Finance',
        logoPath: '/weft-logo.png',
        websiteUrl: 'https://weft.finance/',
      },
    ],
  },
  {
    id: 'ph_le_der',
    name: 'Lend XRD / LSUs',
    description:
      'Lend XRD or LSULP on Root or WEFT. This also counts for your multiplier!',
    category: 'lendingXrdDerivative',
    dapp: '',
    component_addresses: '',
    AP: true,
    multiplier: true,
    seasonPointsPerWeek: 100000,
    dappLogos: [
      {
        name: 'Root Finance',
        logoPath: '/root-logo.png',
        websiteUrl: 'https://rootfinance.xyz/',
      },
      {
        name: 'Weft Finance',
        logoPath: '/weft-logo.png',
        websiteUrl: 'https://weft.finance/',
      },
    ],
  },
  {
    id: 'ph_le_sta',
    name: 'Lend USDC/T',
    description: 'Lend hUSDC, hUSDT, xUSDC, or xUSDT on Root or WEFT.',
    category: 'lendingStables',
    dapp: '',
    component_addresses: '',
    AP: true,
    multiplier: false,
    seasonPointsPerWeek: 500000,
    dappLogos: [
      {
        name: 'Root Finance',
        logoPath: '/root-logo.png',
        websiteUrl: 'https://rootfinance.xyz/',
      },
      {
        name: 'Weft Finance',
        logoPath: '/weft-logo.png',
        websiteUrl: 'https://weft.finance/',
      },
    ],
  },
  {
    id: 'ph_tx',
    name: 'Make Radix Transactions',
    description:
      "Every transaction on Radix counts. Pay transaction fees, interact with the network, and you'll earn points as part of your regular activity.",
    category: 'transactionFees',
    dapp: '',
    component_addresses: '',
    AP: true,
    multiplier: false,
    seasonPointsPerWeek: 100000,
  },
];

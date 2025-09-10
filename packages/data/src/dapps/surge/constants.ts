import { Assets } from '../../assets';

const EXCHANGE_ADDRESS =
  'component_rdx1cz5dduz6flgsmx7frc0854nk545s69nryvgq0y02r2mlm3tsryk6xx';

export const SurgeConstants = {
  slp: {
    resourceAddress:
      'resource_rdx1t48x0z68dm6z422wxyctj5wvnt2nh95lvmly65vxzywdkd24zypl5d',
  },
  marginPool: {
    componentAddress:
      'component_rdx1crezrpxw9ypg6v2panqjqwevnwplg94yeej0rhqq9k7p4kgnltrc9g',
  },
  exchange: {
    // This is hardcoded and changes every time Surge upgrades, it will be out of date soon.
    // The incentives program detects upgrades and stores the new componentAddress in the config table of the database
    componentAddress:
      //'component_rdx1cp92uemllvxuewz93s5h8f36plsmrysssjjl02vve3zvsdlyxhmne7', // use if state_version < 346689452
      EXCHANGE_ADDRESS,
  },
  sUSD: {
    resourceAddress:
      'resource_rdx1th3uhn6905l2vh49z2d83xgr45a08dkxn8ajxmt824ctpdu69msp89',
  },
  // Holding pools for XRD and LSULP on the exchange
  marginAccountCollaterals: {
    xrd: {
      componentAddress: EXCHANGE_ADDRESS,
      token: Assets.Fungible.XRD,
    },
    lsulp: {
      componentAddress: EXCHANGE_ADDRESS,
      token: Assets.Fungible.LSULP,
    },
  },
  // Trading pairs supported by Surge
  tradingPairs: [
    'btc-usd',
    'eth-usd',
    'sol-usd',
    'xrd-usd',
    'sui-usd',
    'doge-usd',
    'ada-usd',
    'bnb-usd',
    'xrp-usd',
    'pepe-usd',
    'link-usd',
    'hype-usd',
  ],
};

import { DappId } from '../types';
import { CaviarNineConstants } from './caviarnine/constants';
import { DefiPlazaConstants } from './defiPlaza/constants';
import { FluxConstants } from './flux/constants';
import { OciswapConstants } from './ociswap/constants';
import { RootFinanceConstants } from './rootFinance/constants';
import { SurgeConstants } from './surge/constants';
import {
  WeftFinanceConstants,
  weftFungibleRecourceAddresses,
} from './weftFinance/constants';

export const dappsData = [
  {
    id: DappId.caviarnine,
    website: 'https://www.caviarnine.com',
    name: 'Caviarnine',
  },
  {
    id: DappId.defiPlaza,
    website: 'https://radix.defiplaza.net',
    name: 'DefiPlaza',
  },
  { id: DappId.ociswap, website: 'https://ociswap.com', name: 'Ociswap' },
  {
    id: DappId.root,
    website: 'https://app.rootfinance.xyz',
    name: 'Root Finance',
  },
  {
    id: DappId.weft,
    website: 'https://app.weft.finance',
    name: 'Weft Finance',
  },
  { id: DappId.surge, website: 'https://www.surge.trade', name: 'Surge' },
  { id: DappId.radix, website: 'https://radixdlt.com', name: 'Radix' },
  {
    id: DappId.astrolescent,
    website: 'https://astrolescent.com',
    name: 'Astrolescent',
  },
  { id: DappId.flux, website: 'https://flux.ilikeitstable.com', name: 'Flux' },
];

export const DappConstants = {
  CaviarNine: {
    id: DappId.caviarnine,
    website: 'https://www.caviarnine.com',
    name: 'Caviarnine',
    constants: CaviarNineConstants,
  },
  Ociswap: {
    id: DappId.ociswap,
    website: 'https://ociswap.com',
    name: 'Ociswap',
    constants: OciswapConstants,
  },
  DefiPlaza: {
    id: DappId.defiPlaza,
    website: 'https://radix.defiplaza.net',
    name: 'DefiPlaza',
    constants: DefiPlazaConstants,
  },
  RootFinance: {
    id: DappId.root,
    website: 'https://app.rootfinance.xyz',
    name: 'Root Finance',
    constants: RootFinanceConstants,
  },
  WeftFinance: {
    id: DappId.weft,
    website: 'https://app.weft.finance',
    name: 'Weft Finance',
    constants: WeftFinanceConstants,
    weftFungibleRecourceAddresses,
  },
  Surge: {
    id: DappId.surge,
    website: 'https://www.surge.trade',
    name: 'Surge',
    constants: SurgeConstants,
  },
  Flux: {
    id: DappId.flux,
    website: 'https://flux.ilikeitstable.com',
    name: 'Flux',
    constants: FluxConstants,
  },
} as const;

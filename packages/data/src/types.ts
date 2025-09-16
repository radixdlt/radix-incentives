import { z } from 'zod';
import type { ActivityCategoryId } from './activityCategories';
import type { TokenDetails } from './helpers/getTokenPair';

export const DappId = {
  caviarnine: 'c9',
  defiPlaza: 'dp',
  ociswap: 'oc',
  root: 'ro',
  weft: 'we',
  surge: 'su',
  radix: 'ra',
  astrolescent: 'as',
} as const;

export type DappId = (typeof DappId)[keyof typeof DappId];

export const AccountBalanceData = z.object({
  activityId: z.string(),
  usdValue: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  poolShare: z.record(z.string(), z.number()).optional(),
});

export type AccountBalanceData = Omit<
  z.infer<typeof AccountBalanceData>,
  'activityId'
> & {
  activityId: string;
};

export const Action = {
  LP: 'lp',
  HOLD: 'ho',
  TRADE: 'tr',
  LEND: 'le',
  OTHER: 'ot',
};

export type Action = (typeof Action)[keyof typeof Action];

export type ActivityData = {
  activityId: string;
  categoryId: ActivityCategoryId;
  action: Action;
  componentAddresses: string[];
  dAppId: DappId;
  tokenPair: string;
  assets: TokenDetails[];
  metadata?: Record<string, string>;
};

export const deriveLpActionFromDappId = (dAppId: DappId) => {
  switch (dAppId) {
    case DappId.caviarnine:
    case DappId.defiPlaza:
    case DappId.ociswap:
    case DappId.surge:
      return Action.LP;

    case DappId.root:
    case DappId.weft:
      return Action.LEND;
  }
};

export const deriveLpActivityId = (input: {
  dAppId: DappId;
  tokenPair: string;
  tokenDetails: TokenDetails;
  isSingleTokenPool: boolean;
}) => {
  const { dAppId, tokenPair, isSingleTokenPool, tokenDetails } = input;

  const action = deriveLpActionFromDappId(dAppId);

  const lpActivityId = isSingleTokenPool
    ? `${dAppId}_${action}_${tokenDetails.assetType}_${tokenDetails.name}`
    : `${dAppId}_${action}_${tokenDetails.assetType}_${tokenPair}`;

  return lpActivityId;
};

export const deriveHoldActivityId = (input: {
  dAppId: DappId;
  tokenPair: string;
  tokenDetails: TokenDetails;
  isSingleTokenPool: boolean;
}) => {
  const { dAppId, tokenPair, isSingleTokenPool, tokenDetails } = input;

  const lpActivityId = isSingleTokenPool
    ? `${dAppId}_${Action.HOLD}_${tokenDetails.name}`
    : `${dAppId}_${Action.HOLD}_${tokenPair}`;

  return lpActivityId;
};

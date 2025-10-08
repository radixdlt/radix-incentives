import fs from 'node:fs';
import path from 'node:path';
import { Effect, pipe } from 'effect';
import { groupBy } from 'effect/Array';
import { ActivityCategoryId } from './activityCategories';
import { Assets, AssetType } from './assets';
import { CaviarNineConstants } from './dapps/caviarnine/constants';
import { DefiPlazaConstants } from './dapps/defiPlaza/constants';
import { FluxConstants } from './dapps/flux/constants';
import { OciswapConstants } from './dapps/ociswap/constants';
import { RootFinanceConstants } from './dapps/rootFinance/constants';
import { SurgeConstants } from './dapps/surge/constants';
import {
  WeftFinanceConstants,
  weftFungibleRecourceAddresses,
} from './dapps/weftFinance/constants';
import {
  getTokenPairFromResourceAddresses,
  type TokenDetails,
} from './helpers/getTokenPair';
import { deduplicate, flatten, sort } from './helpers/utils';
import { Action, type ActivityData, DappId, deriveLpActivityId } from './types';

const PoolType = {
  DEX: 'DEX',
  LENDING: 'LENDING',
  HOLDING: 'HOLDING',
} as const;

type PoolType = (typeof PoolType)[keyof typeof PoolType];

type DexPool = {
  dAppId: DappId;
  poolType: (typeof PoolType)['DEX'];
  tokens: [string, string] | [string];
  componentAddress: string;
  metadata?: Record<string, string>;
};

type LendingPool = {
  dAppId: DappId;
  poolType: (typeof PoolType)['LENDING'];
  tokens: [string];
  componentAddress: string;
};

type HoldingPool = {
  dAppId: DappId;
  poolType: (typeof PoolType)['HOLDING'];
  tokens: [string];
  componentAddress: string;
};

type Pool = DexPool | LendingPool | HoldingPool;

const outputPath = path.join(import.meta.dirname, 'output', 'activities.ts');

// c9 shape liquidity LP: https://www.caviarnine.com/earn/shape-liquidity/pool/${componentAddress}
// c9 simple pool LP: https://www.caviarnine.com/earn/simple-pool/${componentAddress}

const allCaviarNinePools = [
  ...Object.values(CaviarNineConstants.shapeLiquidityPools).map((pool) => ({
    ...pool,
    metadata: {
      type: 'shapeLiquidity',
      url: `https://www.caviarnine.com/earn/shape-liquidity/pool/${pool.componentAddress}`,
    },
  })),
  ...Object.values(CaviarNineConstants.simplePools).map((pool) => ({
    ...pool,
    metadata: {
      type: 'simplePool',
      url: `https://www.caviarnine.com/earn/simple-pool/${pool.componentAddress}`,
    },
  })),
  {
    ...CaviarNineConstants.HLP,
    metadata: {
      type: 'hyperstakePool',
      url: `https://www.caviarnine.com/earn/hyper-stake`,
    },
  },
].map(
  (pool): DexPool => ({
    dAppId: DappId.caviarnine,
    poolType: PoolType.DEX,
    tokens: [pool.token_x, pool.token_y],
    componentAddress: pool.componentAddress,
    metadata: pool.metadata,
  }),
);

// oci https://ociswap.com/pools/${componentAddress}
const allOciswapPools = [
  ...Object.values(OciswapConstants.flexPools).map((pool) => ({
    ...pool,
    metadata: {
      type: 'flexPool',
      url: `https://ociswap.com/pools/${pool.componentAddress}`,
    },
  })),
  ...Object.values(OciswapConstants.pools).map((pool) => ({
    ...pool,
    metadata: {
      type: 'pool',
      url: `https://ociswap.com/pools/${pool.componentAddress}`,
    },
  })),
  ...Object.values(OciswapConstants.poolsV2).map((pool) => ({
    ...pool,
    metadata: {
      type: 'poolV2',
      url: `https://ociswap.com/pools/${pool.componentAddress}`,
    },
  })),
  ...Object.values(OciswapConstants.basicPools).map((pool) => ({
    ...pool,
    metadata: {
      type: 'basicPool',
      url: `https://ociswap.com/pools/${pool.componentAddress}`,
    },
  })),
].map(
  (pool): DexPool => ({
    dAppId: DappId.ociswap,
    poolType: PoolType.DEX,
    tokens: [pool.token_x, pool.token_y],
    componentAddress: pool.componentAddress,
    metadata: pool.metadata,
  }),
);

// defi plaza https://radix.defiplaza.net/liquidity/add/${baseResourceAddress}?direction=base
// defi plaza https://radix.defiplaza.net/liquidity/add/${quoteResourceAddress}?direction=quote
const allDefiPlazaPools = [...Object.values(DefiPlazaConstants)].map(
  (pool): DexPool => ({
    dAppId: DappId.defiPlaza,
    poolType: PoolType.DEX,
    tokens: [pool.baseResourceAddress, pool.quoteResourceAddress],
    componentAddress: pool.componentAddress,
    metadata: {
      url: `https://radix.defiplaza.net/liquidity/add/${pool.baseResourceAddress}?direction=base`,
    },
  }),
);

const allSurgePools = [
  {
    dAppId: DappId.surge,
    poolType: PoolType.DEX,
    tokens: [SurgeConstants.sUSD.resourceAddress],
    componentAddress: SurgeConstants.marginPool.componentAddress,
    metadata: {
      url: `https://www.surge.trade/liquidity`,
    },
  } satisfies DexPool,
  // XRD holding pool for margin collateral
  {
    dAppId: DappId.surge,
    poolType: PoolType.HOLDING,
    tokens: [SurgeConstants.marginAccountCollaterals.xrd.token],
    componentAddress:
      SurgeConstants.marginAccountCollaterals.xrd.componentAddress,
  } satisfies HoldingPool,
  // LSULP holding pool for margin collateral
  {
    dAppId: DappId.surge,
    poolType: PoolType.HOLDING,
    tokens: [SurgeConstants.marginAccountCollaterals.lsulp.token],
    componentAddress:
      SurgeConstants.marginAccountCollaterals.lsulp.componentAddress,
  } satisfies HoldingPool,
];

const allWeftPools: LendingPool[] = Object.values(WeftFinanceConstants.v2)
  .map((item) => {
    if (item.type !== 'fungible') {
      return null;
    }
    const token = weftFungibleRecourceAddresses.get(item.resourceAddress);
    if (!token) {
      return null;
    }

    return {
      dAppId: DappId.weft,
      poolType: PoolType.LENDING,
      tokens: [token],
      componentAddress: WeftFinanceConstants.v2.WeftyV2.componentAddress,
    } satisfies LendingPool;
  })
  .filter((item) => item !== null);

const allRootPools = Object.values(RootFinanceConstants.supportedAssets).map(
  (item): LendingPool => ({
    dAppId: DappId.root,
    poolType: PoolType.LENDING,
    tokens: [item.resourceAddress],
    componentAddress: RootFinanceConstants.componentAddress,
  }),
);

const allPools: Pool[] = [
  ...allCaviarNinePools,
  ...allOciswapPools,
  ...allDefiPlazaPools,
  ...allSurgePools,
  ...allWeftPools,
  ...allRootPools,
];

const assetTypeToCategoryId = (assetType: AssetType, poolType: PoolType) => {
  // For holding pools (like Surge margin collateral), use maintainXrdBalance category
  if (poolType === PoolType.HOLDING) {
    return ActivityCategoryId.maintainXrdBalance;
  }

  switch (assetType) {
    case AssetType.XRD_DERIVATIVE:
      return poolType === PoolType.DEX
        ? ActivityCategoryId.provideXrdDerivativeLiquidityToDex
        : ActivityCategoryId.lendingXrdDerivative;
    case AssetType.STABLE:
      return poolType === PoolType.DEX
        ? ActivityCategoryId.provideStablesLiquidityToDex
        : ActivityCategoryId.lendingStables;
    case AssetType.BLUECHIP:
      return poolType === PoolType.DEX
        ? ActivityCategoryId.provideBlueChipLiquidityToDex
        : ActivityCategoryId.lendingBlueChips;
    case AssetType.NATIVE:
      return poolType === PoolType.DEX
        ? ActivityCategoryId.provideNativeLiquidityToDex
        : ActivityCategoryId.lendingNative;
    default:
      throw new Error(`Unknown asset type: ${assetType}`);
  }
};

const deriveActionFromPool = (input: Pool) => {
  if (input.poolType === PoolType.DEX) {
    return Action.LP;
  }
  if (input.poolType === PoolType.HOLDING) {
    return Action.HOLD;
  }
  return Action.LEND;
};

const deriveActivities = (
  input: Pool & {
    assets: TokenDetails[];
    tokenPair: string;
  },
) => {
  const { dAppId, tokenPair, assets, componentAddress, poolType } = input;

  const metadata = poolType === PoolType.DEX ? input.metadata : undefined;

  const action = deriveActionFromPool(input);

  return assets.flatMap((asset) => {
    const isSingleTokenPool =
      assets.length === 1 ||
      assets[0].resourceAddress === assets[1]?.resourceAddress;

    const isSameAssetType = assets[0].assetType === assets[1]?.assetType;

    const holdActivityId = isSingleTokenPool
      ? `${dAppId}_${Action.HOLD}_${asset.name}`
      : `${dAppId}_${Action.HOLD}_${tokenPair}`;

    const lpActivityId = deriveLpActivityId({
      dAppId,
      tokenPair,
      isSingleTokenPool,
      tokenDetails: asset,
    });

    const primaryActivityId =
      action === Action.HOLD ? holdActivityId : lpActivityId;

    const activities: {
      activityId: string;
      categoryId: ActivityCategoryId;
      action: Action;
      componentAddress: string;
      dAppId: DappId;
      tokenPair: string;
      assets: TokenDetails[];
      metadata?: Record<string, string>;
    }[] = [
      {
        categoryId: assetTypeToCategoryId(asset.assetType, poolType),
        activityId: primaryActivityId,
        componentAddress,
        dAppId,
        tokenPair,
        assets: isSameAssetType && !isSingleTokenPool ? assets : [asset],
        action,
        metadata,
      },
    ];

    // Only add trading volume activity if the tokens are different.
    // e.g. LSULP pool should not have a trading volume activity
    if (!isSingleTokenPool && poolType === 'DEX') {
      const tradeActivityId = `${dAppId}_${Action.TRADE}_${tokenPair}`;
      activities.push({
        categoryId: ActivityCategoryId.tradingVolume,
        activityId: tradeActivityId,
        componentAddress,
        dAppId,
        tokenPair,
        assets,
        action: Action.TRADE,
      });
    }

    // Only add XRD derivative holding activity if it's not already a HOLDING pool
    // (HOLDING pools already generate the correct holding activity as their primary activity)
    if (
      asset.assetType === AssetType.XRD_DERIVATIVE &&
      poolType !== PoolType.HOLDING
    ) {
      activities.push({
        categoryId: ActivityCategoryId.maintainXrdBalance,
        activityId: holdActivityId,
        componentAddress,
        dAppId,
        tokenPair,
        assets: [asset],
        action: Action.HOLD,
      });
    }

    return activities;
  });
};

const deriveActivityDetails = Effect.fn(function* (input: Pool) {
  const { tokens } = input;

  const tokenA = tokens[0];
  const tokenB = tokens.length === 2 ? tokens[1] : tokenA;

  const { tokenPair, assets } = yield* getTokenPairFromResourceAddresses(
    tokenA,
    tokenB,
  );

  // For HOLDING pools with single tokens, deduplicate assets to avoid duplicate activities
  const deduplicatedAssets =
    input.poolType === PoolType.HOLDING
      ? assets.filter(
          (asset, index, arr) =>
            arr.findIndex(
              (a) => a.resourceAddress === asset.resourceAddress,
            ) === index,
        )
      : assets;

  const activities = deriveActivities({
    ...input,
    tokenPair,
    assets: deduplicatedAssets,
  });

  return activities;
});

const arrayToRecord = (items: string[]) =>
  items.reduce<Record<string, string>>((acc, curr) => {
    acc[curr] = curr;
    return acc;
  }, {});

const runnable = Effect.gen(function* () {
  const activities = yield* Effect.forEach(
    allPools,
    deriveActivityDetails,
  ).pipe(Effect.map(flatten));

  // additional activities that didn't fit into the pool structure
  activities.push(
    {
      categoryId: ActivityCategoryId.maintainXrdBalance,
      activityId: `${Action.HOLD}_xrd`,
      componentAddress: '',
      dAppId: DappId.radix,
      tokenPair: '',
      action: Action.HOLD,
      assets: [
        {
          assetType: AssetType.NATIVE,
          name: 'xrd',
          resourceAddress: Assets.Fungible.XRD,
        },
      ],
    },
    {
      categoryId: ActivityCategoryId.maintainXrdBalance,
      activityId: `${Action.HOLD}_lsulp`,
      componentAddress: '',
      dAppId: DappId.radix,
      tokenPair: '',
      action: Action.HOLD,
      assets: [
        {
          assetType: AssetType.NATIVE,
          name: 'lsulp',
          resourceAddress: CaviarNineConstants.LSULP.resourceAddress,
        },
      ],
    },
    {
      categoryId: ActivityCategoryId.maintainXrdBalance,
      activityId: `${Action.HOLD}_stakedXrd`,
      componentAddress: '',
      dAppId: DappId.radix,
      tokenPair: '',
      action: Action.HOLD,
      assets: [],
    },
    {
      categoryId: ActivityCategoryId.maintainXrdBalance,
      activityId: `${Action.HOLD}_unstakedXrd`,
      componentAddress: '',
      dAppId: DappId.radix,
      tokenPair: '',
      action: Action.HOLD,
      assets: [],
    },
    {
      categoryId: ActivityCategoryId.maintainXrdBalance,
      activityId: `${DappId.weft}_${Action.HOLD}_stakedXrd`,
      componentAddress: WeftFinanceConstants.v2.WeftyV2.componentAddress,
      dAppId: DappId.weft,
      tokenPair: 'stakedXrd',
      action: Action.HOLD,
      assets: [],
    },
    {
      categoryId: ActivityCategoryId.maintainXrdBalance,
      activityId: `${DappId.weft}_${Action.HOLD}_unstakedXrd`,
      componentAddress: WeftFinanceConstants.v2.WeftyV2.componentAddress,
      dAppId: DappId.weft,
      tokenPair: 'unstakedXrd',
      action: Action.HOLD,
      assets: [],
    },
    {
      categoryId: ActivityCategoryId.maintainXrdBalance,
      activityId: `${DappId.weft}_${Action.HOLD}_lsulp`,
      componentAddress: WeftFinanceConstants.v2.WeftyV2.componentAddress,
      dAppId: DappId.weft,
      tokenPair: 'lsulp',
      action: Action.HOLD,
      assets: [
        {
          assetType: AssetType.NATIVE,
          name: 'lsulp',
          resourceAddress: CaviarNineConstants.LSULP.resourceAddress,
        },
      ],
    },
    // Surge trading activities for all supported pairs
    ...SurgeConstants.tradingPairs.map((pair) => ({
      categoryId: ActivityCategoryId.tradingVolume,
      activityId: `${DappId.surge}_${Action.TRADE}_${pair}`,
      componentAddress: SurgeConstants.exchange.componentAddress,
      dAppId: DappId.surge,
      tokenPair: pair,
      action: Action.TRADE,
      assets: [],
    })),
    {
      categoryId: ActivityCategoryId.componentCalls,
      activityId: 'componentCalls',
      componentAddress: '',
      dAppId: DappId.radix,
      tokenPair: '',
      action: Action.OTHER,
      assets: [],
    },
    {
      categoryId: ActivityCategoryId.transactionFees,
      activityId: 'txFees',
      componentAddress: '',
      dAppId: DappId.radix,
      tokenPair: '',
      action: Action.OTHER,
      assets: [],
    },
    {
      categoryId: ActivityCategoryId.common,
      activityId: 'common',
      componentAddress: '',
      dAppId: DappId.radix,
      tokenPair: '',
      action: Action.OTHER,
      assets: [],
    },
    // TODO: Flux activities, manually defined here, don't know exactly which activities to go with.
    ...[
      {
        category: ActivityCategoryId.lendingStables,
        id: 'sta_fusd',
        component: FluxConstants.cdpManager.componentAddress,
        action: Action.LEND,
        asset: {
          type: AssetType.STABLE,
          name: 'fusd',
          address: Assets.Fungible.fUSD,
        },
      },
      {
        category: ActivityCategoryId.maintainXrdBalance,
        id: 'xrd',
        component: FluxConstants.cdpManager.componentAddress,
        action: Action.HOLD,
        asset: {
          type: AssetType.NATIVE,
          name: 'xrd',
          address: Assets.Fungible.XRD,
        },
      },
      {
        category: ActivityCategoryId.maintainXrdBalance,
        id: 'lsulp',
        component: FluxConstants.cdpManager.componentAddress,
        action: Action.HOLD,
        asset: {
          type: AssetType.XRD_DERIVATIVE,
          name: 'lsulp',
          address: FluxConstants.collaterals.lsulp.collateralAddress,
        },
      },
      {
        category: ActivityCategoryId.maintainXrdBalance,
        id: 'xrdfusd',
        component: FluxConstants.reservoirs.xrd.componentAddress,
        action: Action.HOLD,
        asset: {
          type: AssetType.NATIVE,
          name: 'xrd',
          address: Assets.Fungible.XRD,
        },
      },
      {
        category: ActivityCategoryId.maintainXrdBalance,
        id: 'lsulpfusd',
        component: FluxConstants.reservoirs.lsulp.componentAddress,
        action: Action.HOLD,
        asset: {
          type: AssetType.XRD_DERIVATIVE,
          name: 'lsulp',
          address: FluxConstants.collaterals.lsulp.collateralAddress,
        },
      },
      {
        category: ActivityCategoryId.provideStablesLiquidityToDex,
        id: 'sta_xrdfusd',
        component: FluxConstants.reservoirs.xrd.componentAddress,
        action: Action.LP,
        asset: {
          type: AssetType.STABLE,
          name: 'fusd',
          address: Assets.Fungible.fUSD,
        },
      },
      {
        category: ActivityCategoryId.provideStablesLiquidityToDex,
        id: 'sta_lsulpfusd',
        component: FluxConstants.reservoirs.lsulp.componentAddress,
        action: Action.LP,
        asset: {
          type: AssetType.STABLE,
          name: 'fusd',
          address: Assets.Fungible.fUSD,
        },
      },
      {
        category: ActivityCategoryId.provideXrdDerivativeLiquidityToDex,
        id: 'der_lsulpfusd',
        component: FluxConstants.reservoirs.lsulp.componentAddress,
        action: Action.LP,
        asset: {
          type: AssetType.XRD_DERIVATIVE,
          name: 'lsulp',
          address: FluxConstants.collaterals.lsulp.collateralAddress,
        },
      },
      {
        category: ActivityCategoryId.provideNativeLiquidityToDex,
        id: 'der_xrdfusd',
        component: FluxConstants.reservoirs.xrd.componentAddress,
        action: Action.LP,
        asset: {
          type: AssetType.NATIVE,
          name: 'xrd',
          address: Assets.Fungible.XRD,
        },
      },
    ].map((spec) => ({
      categoryId: spec.category,
      activityId: `${DappId.flux}_${spec.action}_${spec.id}`,
      componentAddress: spec.component,
      dAppId: DappId.flux,
      tokenPair: spec.id,
      action: spec.action,
      assets: [
        {
          assetType: spec.asset.type,
          name: spec.asset.name,
          resourceAddress: spec.asset.address,
        },
      ],
    })),
  );

  const groupedActivities = groupBy(activities, (item) => item.activityId);

  const deduplicatedActivities = Object.entries(groupedActivities).map(
    ([_, activities]) => {
      const firstActivity = activities[0];
      const componentAddresses = new Set(
        activities
          .map((item) => item.componentAddress)
          .filter((item) => !!item),
      );

      const { componentAddress, ...activityWithoutSingularComponentAddress } =
        firstActivity;
      return {
        ...activityWithoutSingularComponentAddress,
        componentAddresses: Array.from(componentAddresses.values()),
      };
    },
  );

  const activityMap = pipe(
    deduplicatedActivities,
    (items) => items.map((item) => [item.activityId, item]),
    (items) => Object.fromEntries(items),
  );

  const activitiesGroupedByDappId = pipe(
    deduplicatedActivities,
    groupBy((item) => item.dAppId),
  );

  // Ensure all DappIds are present in the output, even if they have no activities
  Object.values(DappId).forEach((dappId) => {
    if (!activitiesGroupedByDappId[dappId]) {
      activitiesGroupedByDappId[dappId] = [];
    }
  });

  const activityIds = pipe(
    deduplicatedActivities,
    (items) => items.map((item) => item.activityId),
    deduplicate,
    sort,
    arrayToRecord,
  );

  const componentAddresses = pipe(
    activities,
    (items) => items.map((item) => item.componentAddress),
    (items) => items.filter((item) => !!item),
    deduplicate,
    sort,
  );

  const allTradingActivities = pipe(activities, (items) =>
    items.filter((item) => item.action === Action.TRADE),
  );

  const allLpActivities = pipe(activities, (items) =>
    items.filter((item) => item.action === Action.LP),
  );

  const tradingActivityIdByComponentAddress = pipe(
    allTradingActivities,
    (items) => items.map((item) => [item.componentAddress, item.activityId]),
    (items) => Object.fromEntries(items),
  );

  const lpActivityIdByComponentAddress = pipe(
    allLpActivities,
    (items) => items.map((item) => [item.componentAddress, item.activityId]),
    (items) => Object.fromEntries(items),
  );

  const componentAddressToActivityDataMap: Record<
    string,
    Omit<ActivityData, 'componentAddresses'>[]
  > = pipe(
    activities,
    (items) => groupBy(items, (item) => item.componentAddress),
    (items) => Object.entries(items),
    (items) => items.filter(([componentAddress]) => componentAddress !== ''),
    (items) =>
      items.map(([componentAddress, activities]) => [
        componentAddress,
        activities.map(({ componentAddress, ...item }) => item),
      ]),
    (items) => Object.fromEntries(items),
  );

  const output = [
    '// DO NOT EDIT THIS FILE',
    '// This file is auto-generated by generateActivities.ts',
    `import type { ActivityData, DappId } from "../types";`,

    `export const ActivityId = ${JSON.stringify(activityIds, null, 2)} as const`,

    'export type ActivityId = (typeof ActivityId)[keyof typeof ActivityId];',

    `export const matchActivityId = (input: string) =>
    !!ActivityId[input as keyof typeof ActivityId];`,

    `const componentAddresses = ${JSON.stringify(componentAddresses, null, 2)}`,

    'const componentAddressSet = new Set(componentAddresses);',

    `export const matchComponentAddress = (input: string) =>
    componentAddressSet.has(input);`,

    `const componentAddressTradingActivityIdMap: Record<string, ActivityId> = ${JSON.stringify(
      tradingActivityIdByComponentAddress,
      null,
      2,
    )}`,

    `export const getTradingActivityIdByComponentAddress = (componentAddress: string): ActivityId | undefined =>
    componentAddressTradingActivityIdMap[componentAddress];`,

    `const componentAddressLpActivityIdMap: Record<string, ActivityId> = ${JSON.stringify(
      lpActivityIdByComponentAddress,
      null,
      2,
    )}`,

    `export const getLpActivityIdByComponentAddress = (componentAddress: string): ActivityId | undefined =>
    componentAddressLpActivityIdMap[componentAddress];`,

    `export const activityDataByDappId: Record<DappId, ActivityData[]> = ${JSON.stringify(
      activitiesGroupedByDappId,
      null,
      2,
    )} as any;`,

    `export const activityData: ActivityData[] = ${JSON.stringify(
      deduplicatedActivities,
      null,
      2,
    )} as any;`,

    `export const activityDataMap: Record<ActivityId, ActivityData> = ${JSON.stringify(
      activityMap,
      null,
      2,
    )} as any;`,

    `export const componentAddressActivityDataMap: Record<string, Omit<ActivityData, "componentAddresses">[]> = ${JSON.stringify(
      componentAddressToActivityDataMap,
      null,
      2,
    )} as any;`,
  ].join('\n\n');

  fs.writeFileSync(outputPath, output);

  console.log('Generated /output/activities.ts');
});

Effect.runPromise(runnable);

// DEX liquidity:
// - Stables (USDC, USDT INCLUDING SURGE LP)
// - Bluechips (BTC, ETH)
// - Radix Natives
// - XRD/LSU (inc hyperstake and LSULP)

// DEX trading:
// - Stables (USDC, USDT)
// - Bluechips (BTC, ETH)
// - Radix Natives
// - XRD/LSU (inc hyperstake and LSULP)

// Lending liquidity:
// - Stables (USDC, USDT)
// - Bluechips (BTC, ETH)
// - Radix Natives
// - XRD/LSU (inc hyperstake and LSULP)

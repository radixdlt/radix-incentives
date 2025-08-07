import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SnapshotService, createDbClientLive } from 'api/incentives';
import { db } from 'db/incentives';
import { Effect, Layer, Logger } from 'effect';

export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'snapshot' },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: 'http://127.0.0.1:4318/v1/traces',
    }),
  ),
}));

import { EntityFungiblesPageService } from '../../../packages/api/src/common/gateway/entityFungiblesPage';
import { EntityNonFungibleDataService } from '../../../packages/api/src/common/gateway/entityNonFungiblesData';
import { EntityNonFungiblesPageService } from '../../../packages/api/src/common/gateway/entityNonFungiblesPage';
// Gateway services
import { GatewayApiClientLive } from '../../../packages/api/src/common/gateway/gatewayApiClient';
import { GetAllValidatorsService } from '../../../packages/api/src/common/gateway/getAllValidators';
import { GetComponentStateService } from '../../../packages/api/src/common/gateway/getComponentState';
import { GetEntityDetailsService } from '../../../packages/api/src/common/gateway/getEntityDetails';
import { GetFungibleBalanceService } from '../../../packages/api/src/common/gateway/getFungibleBalance';
import { GetKeyValueStoreService } from '../../../packages/api/src/common/gateway/getKeyValueStore';
import { GetLedgerStateService } from '../../../packages/api/src/common/gateway/getLedgerState';
import { GetNftResourceManagersService } from '../../../packages/api/src/common/gateway/getNftResourceManagers';
import { GetNonFungibleBalanceService } from '../../../packages/api/src/common/gateway/getNonFungibleBalance';
import { GetNonFungibleIdsService } from '../../../packages/api/src/common/gateway/getNonFungibleIds';
import { KeyValueStoreDataService } from '../../../packages/api/src/common/gateway/keyValueStoreData';
import { KeyValueStoreKeysService } from '../../../packages/api/src/common/gateway/keyValueStoreKeys';

import { GetLsulpLive } from '../../../packages/api/src/common/dapps/caviarnine/getLsulp';
import { GetLsulpValueLive } from '../../../packages/api/src/common/dapps/caviarnine/getLsulpValue';
import { ConvertLsuToXrdLive } from '../../../packages/api/src/common/staking/convertLsuToXrd';
// Staking services
import { GetUserStakingPositionsLive } from '../../../packages/api/src/common/staking/getUserStakingPositions';
import { UnstakingReceiptProcessorLive } from '../../../packages/api/src/common/staking/unstakingReceiptProcessor';

import { GetCaviarnineResourcePoolPositionsLive } from '../../../packages/api/src/common/dapps/caviarnine/getCaviarnineResourcePoolPositions';
import { GetHyperstakePositionsLive } from '../../../packages/api/src/common/dapps/caviarnine/getHyperstakePositions';
import { GetQuantaSwapBinMapLive } from '../../../packages/api/src/common/dapps/caviarnine/getQuantaSwapBinMap';
import { GetShapeLiquidityAssetsLive } from '../../../packages/api/src/common/dapps/caviarnine/getShapeLiquidityAssets';
import { GetShapeLiquidityClaimsLive } from '../../../packages/api/src/common/dapps/caviarnine/getShapeLiquidityClaims';
import { GetDefiPlazaPositionsLive } from '../../../packages/api/src/common/dapps/defiplaza/getDefiPlazaPositions';
import { GetOciswapLiquidityAssetsLive } from '../../../packages/api/src/common/dapps/ociswap/getOciswapLiquidityAssets';
import { GetOciswapLiquidityClaimsService } from '../../../packages/api/src/common/dapps/ociswap/getOciswapLiquidityClaims';
import { GetOciswapResourcePoolPositionsLive } from '../../../packages/api/src/common/dapps/ociswap/getOciswapResourcePoolPositions';
import { GetRootFinancePositionsService } from '../../../packages/api/src/common/dapps/rootFinance/getRootFinancePositions';
import { GetSurgeLiquidityPositionsLive } from '../../../packages/api/src/common/dapps/surge/getSurgeLiquidityPositions';
// DApp services
import { GetWeftFinancePositionsService } from '../../../packages/api/src/common/dapps/weftFinance/getWeftFinancePositions';

// Resource pool services
import { GetResourcePoolUnitsLive } from '../../../packages/api/src/common/resource-pool/getResourcePoolUnits';

import { AggregateAccountBalanceLive } from '../../../packages/api/src/incentives/account-balance/aggregateAccountBalance';
import { AggregateCaviarninePositionsLive } from '../../../packages/api/src/incentives/account-balance/aggregateCaviarninePositions';
import { AggregateDefiPlazaPositionsLive } from '../../../packages/api/src/incentives/account-balance/aggregateDefiPlazaPositions';
import { AggregateOciswapPositionsLive } from '../../../packages/api/src/incentives/account-balance/aggregateOciswapPositions';
import { AggregateRootFinancePositionsLive } from '../../../packages/api/src/incentives/account-balance/aggregateRootFinancePositions';
import { AggregateSurgePositionsLive } from '../../../packages/api/src/incentives/account-balance/aggregateSurgePositions';
import { AggregateWeftFinancePositionsLive } from '../../../packages/api/src/incentives/account-balance/aggregateWeftFinancePositions';
import { XrdBalanceLive } from '../../../packages/api/src/incentives/account-balance/aggregateXrdBalance';
import { GetAccountBalancesAtStateVersionLive } from '../../../packages/api/src/incentives/account-balance/getAccountBalancesAtStateVersion';
import { UpsertAccountBalancesLive } from '../../../packages/api/src/incentives/account-balance/upsertAccountBalance';
// Account and balance services
import { GetAccountAddressesLive } from '../../../packages/api/src/incentives/account/getAccounts';

// Snapshot services
import { CreateSnapshotLive } from '../../../packages/api/src/incentives/snapshot/createSnapshot';
import { UpdateSnapshotLive } from '../../../packages/api/src/incentives/snapshot/updateSnapshot';

import { AddressValidationServiceLive } from '../../../packages/api/src/common/address-validation/addressValidation';
import { AggregatePoolPositionsService } from '../../../packages/api/src/incentives/account-balance/aggregatePoolPositions';
// USD and validation services
import { GetUsdValueLive } from '../../../packages/api/src/incentives/token-price/getUsdValue';

const runnable = Effect.gen(function* () {
  const dbClientLive = createDbClientLive(db);

  const gatewayApiClientLive = GatewayApiClientLive;

  const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

  const getLedgerStateLive = GetLedgerStateService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

  const getAllValidatorsServiceLive = GetAllValidatorsService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

  const entityFungiblesPageServiceLive =
    EntityFungiblesPageService.Default.pipe(
      Layer.provide(gatewayApiClientLive),
    );

  const stateEntityDetailsLive = GetFungibleBalanceService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
  );

  const entityNonFungiblesPageServiceLive =
    EntityNonFungiblesPageService.Default.pipe(
      Layer.provide(gatewayApiClientLive),
    );

  const entityNonFungibleDataServiceLive =
    EntityNonFungibleDataService.Default.pipe(
      Layer.provide(gatewayApiClientLive),
    );

  const getNonFungibleIdsLive = GetNonFungibleIdsService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

  const getNftResourceManagersLive = GetNftResourceManagersService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(getNonFungibleIdsLive),
  );

  const getNonFungibleBalanceLive = GetNonFungibleBalanceService.Default.pipe(
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getNftResourceManagersLive),
  );

  const getUserStakingPositionsLive = GetUserStakingPositionsLive.pipe(
    Layer.provide(getAllValidatorsServiceLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getNonFungibleBalanceLive),
  );

  const getLsulpLive = GetLsulpLive.pipe(
    Layer.provide(entityFungiblesPageServiceLive),
  );

  const convertLsuToXrdLive = ConvertLsuToXrdLive.pipe(
    Layer.provide(getEntityDetailsServiceLive),
  );

  const getLsulpValueLive = GetLsulpValueLive.pipe(
    Layer.provide(entityFungiblesPageServiceLive),
  );

  const getComponentStateServiceLive = GetComponentStateService.Default.pipe(
    Layer.provide(getEntityDetailsServiceLive),
  );

  const keyValueStoreDataServiceLive = KeyValueStoreDataService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

  const keyValueStoreKeysServiceLive = KeyValueStoreKeysService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

  const getKeyValueStoreServiceLive = GetKeyValueStoreService.Default.pipe(
    Layer.provide(keyValueStoreDataServiceLive),
    Layer.provide(keyValueStoreKeysServiceLive),
  );

  const getFungibleBalanceLive = GetFungibleBalanceService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive),
  );

  const unstakingReceiptProcessorLive = UnstakingReceiptProcessorLive.pipe(
    Layer.provide(entityNonFungibleDataServiceLive),
  );

  const getWeftFinancePositionsLive =
    GetWeftFinancePositionsService.Default.pipe(
      Layer.provide(getFungibleBalanceLive),
      Layer.provide(getNonFungibleBalanceLive),
      Layer.provide(getKeyValueStoreServiceLive),
      Layer.provide(getComponentStateServiceLive),
      Layer.provide(unstakingReceiptProcessorLive),
    );

  const getRootFinancePositionLive =
    GetRootFinancePositionsService.Default.pipe(
      Layer.provide(getNonFungibleBalanceLive),
      Layer.provide(getKeyValueStoreServiceLive),
    );

  const getQuantaSwapBinMapLive = GetQuantaSwapBinMapLive.pipe(
    Layer.provide(getKeyValueStoreServiceLive),
  );

  const getShapeLiquidityClaimsLive = GetShapeLiquidityClaimsLive.pipe(
    Layer.provide(entityNonFungibleDataServiceLive),
  );

  const getShapeLiquidityAssetsLive = GetShapeLiquidityAssetsLive.pipe(
    Layer.provide(getComponentStateServiceLive),
    Layer.provide(getQuantaSwapBinMapLive),
    Layer.provide(getShapeLiquidityClaimsLive),
    Layer.provide(getNonFungibleBalanceLive),
  );

  const getOciswapLiquidityClaimsLive =
    GetOciswapLiquidityClaimsService.Default.pipe(
      Layer.provide(entityNonFungibleDataServiceLive),
    );

  const getOciswapLiquidityAssetsLive = GetOciswapLiquidityAssetsLive.pipe(
    Layer.provide(getComponentStateServiceLive),
    Layer.provide(getOciswapLiquidityClaimsLive),
    Layer.provide(getNonFungibleBalanceLive),
  );

  const getResourcePoolUnitsLive = GetResourcePoolUnitsLive.pipe(
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getEntityDetailsServiceLive),
  );

  const getDefiPlazaPositionsLive = GetDefiPlazaPositionsLive.pipe(
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getResourcePoolUnitsLive),
  );

  const getHyperstakePositionsLive = GetHyperstakePositionsLive.pipe(
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getResourcePoolUnitsLive),
  );

  const getOciswapResourcePoolPositionsLive =
    GetOciswapResourcePoolPositionsLive.pipe(
      Layer.provide(getFungibleBalanceLive),
      Layer.provide(getResourcePoolUnitsLive),
    );

  const getCaviarnineResourcePoolPositionsLive =
    GetCaviarnineResourcePoolPositionsLive.pipe(
      Layer.provide(getFungibleBalanceLive),
      Layer.provide(getResourcePoolUnitsLive),
    );

  const getSurgeLiquidityPositionsLive = GetSurgeLiquidityPositionsLive.pipe(
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getComponentStateServiceLive),
  );

  const getAccountAddressesLive = GetAccountAddressesLive.pipe(
    Layer.provide(dbClientLive),
  );

  const upsertAccountBalancesLive = UpsertAccountBalancesLive.pipe(
    Layer.provide(dbClientLive),
  );

  const createSnapshotLive = CreateSnapshotLive.pipe(
    Layer.provide(dbClientLive),
  );
  const updateSnapshotLive = UpdateSnapshotLive.pipe(
    Layer.provide(dbClientLive),
  );

  const addressValidationServiceLive = AddressValidationServiceLive;

  const getUsdValueLive = GetUsdValueLive.pipe(
    Layer.provide(addressValidationServiceLive),
  );

  const xrdBalanceLive = XrdBalanceLive.pipe(
    Layer.provide(getUsdValueLive),
    Layer.provide(addressValidationServiceLive),
  );

  const aggregateCaviarninePositionsLive =
    AggregateCaviarninePositionsLive.pipe(
      Layer.provide(getUsdValueLive),
      Layer.provide(addressValidationServiceLive),
    );

  const aggregateOciswapPositionsLive = AggregateOciswapPositionsLive.pipe(
    Layer.provide(getUsdValueLive),
    Layer.provide(addressValidationServiceLive),
  );

  const aggregateWeftFinancePositionsLive =
    AggregateWeftFinancePositionsLive.pipe(Layer.provide(getUsdValueLive));

  const aggregateRootFinancePositionsLive =
    AggregateRootFinancePositionsLive.pipe(Layer.provide(getUsdValueLive));

  const aggregateDefiPlazaPositionsLive = AggregateDefiPlazaPositionsLive.pipe(
    Layer.provide(getUsdValueLive),
    Layer.provide(addressValidationServiceLive),
  );

  const aggregateSurgePositionsLive = AggregateSurgePositionsLive.pipe(
    Layer.provide(getUsdValueLive),
  );

  const aggregateAccountBalanceLive = AggregateAccountBalanceLive.pipe(
    Layer.provide(aggregateCaviarninePositionsLive),
    Layer.provide(aggregateOciswapPositionsLive),
    Layer.provide(xrdBalanceLive),
    Layer.provide(aggregateWeftFinancePositionsLive),
    Layer.provide(aggregateRootFinancePositionsLive),
    Layer.provide(aggregateDefiPlazaPositionsLive),
    Layer.provide(aggregateSurgePositionsLive),
  );

  const gatewayLive = Layer.mergeAll(
    gatewayApiClientLive,
    stateEntityDetailsLive,
    entityFungiblesPageServiceLive,
    getLedgerStateLive,
    entityNonFungiblesPageServiceLive,
    entityNonFungibleDataServiceLive,
    getNonFungibleBalanceLive,
    getNftResourceManagersLive,
    getNonFungibleIdsLive,
    getEntityDetailsServiceLive,
    getResourcePoolUnitsLive,
    getFungibleBalanceLive,
  );

  const stakingLive = Layer.mergeAll(
    getUserStakingPositionsLive,
    getLsulpLive,
    convertLsuToXrdLive,
    getLsulpValueLive,
    getAllValidatorsServiceLive,
  );

  const dappsLive = Layer.mergeAll(
    getWeftFinancePositionsLive,
    getRootFinancePositionLive,
    getDefiPlazaPositionsLive,
    getHyperstakePositionsLive,
    getShapeLiquidityAssetsLive,
    getShapeLiquidityClaimsLive,
    getQuantaSwapBinMapLive,
    getOciswapLiquidityAssetsLive,
    getOciswapLiquidityClaimsLive,
    getOciswapResourcePoolPositionsLive,
    getCaviarnineResourcePoolPositionsLive,
    getSurgeLiquidityPositionsLive,
  );

  const accountBalanceLive = Layer.mergeAll(
    getAccountAddressesLive,
    upsertAccountBalancesLive,
    updateSnapshotLive,
  );

  const getAccountBalancesAtStateVersionLive =
    GetAccountBalancesAtStateVersionLive.pipe(
      Layer.provide(gatewayLive),
      Layer.provide(stakingLive),
      Layer.provide(dappsLive),
      Layer.provide(getFungibleBalanceLive),
    );

  const aggregatePoolPositionsLive = AggregatePoolPositionsService.Default.pipe(
    Layer.provide(getUsdValueLive),
    Layer.provide(addressValidationServiceLive),
  );

  const snapshotLive = SnapshotService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(getAccountBalancesAtStateVersionLive),
    Layer.provide(accountBalanceLive),
    Layer.provide(createSnapshotLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(dbClientLive),
    Layer.provide(getUsdValueLive),
    Layer.provide(aggregateAccountBalanceLive),
    Layer.provide(getAllValidatorsServiceLive),
    Layer.provide(aggregatePoolPositionsLive),
  );

  const service = yield* Effect.provide(SnapshotService, snapshotLive);

  const addresses = yield* Effect.tryPromise(() =>
    db.query.accounts
      .findMany({
        limit: 10,
      })
      .then((res) => res.map((r) => r.address)),
  );

  const testAccountAddress = process.env.TEST_ACCOUNT_ADDRESS;

  yield* service({
    timestamp: new Date('2025-07-20T00:00:00.000Z'),
    batchSize: 10_000,
    addresses: testAccountAddress ? [testAccountAddress] : addresses,
  }).pipe(Effect.provide(NodeSdkLive));
});

await Effect.runPromise(runnable.pipe(Effect.provide(Logger.pretty)));

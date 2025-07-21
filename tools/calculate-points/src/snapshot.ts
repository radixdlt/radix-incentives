import { Effect, Layer, Logger } from "effect";
import { createDbClientLive, SnapshotService } from "api/incentives";
import { db } from "db/incentives";

// Gateway services
import { GatewayApiClientLive } from "../../../packages/api/src/common/gateway/gatewayApiClient";
import { GetEntityDetailsService } from "../../../packages/api/src/common/gateway/getEntityDetails";
import { GetLedgerStateService } from "../../../packages/api/src/common/gateway/getLedgerState";
import { GetFungibleBalanceService } from "../../../packages/api/src/common/gateway/getFungibleBalance";
import { EntityFungiblesPageService } from "../../../packages/api/src/common/gateway/entityFungiblesPage";
import { EntityNonFungiblesPageService } from "../../../packages/api/src/common/gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataService } from "../../../packages/api/src/common/gateway/entityNonFungiblesData";
import { GetNonFungibleBalanceService } from "../../../packages/api/src/common/gateway/getNonFungibleBalance";
import { GetAllValidatorsService } from "../../../packages/api/src/common/gateway/getAllValidators";
import { GetComponentStateService } from "../../../packages/api/src/common/gateway/getComponentState";
import { KeyValueStoreDataService } from "../../../packages/api/src/common/gateway/keyValueStoreData";
import { KeyValueStoreKeysService } from "../../../packages/api/src/common/gateway/keyValueStoreKeys";
import { GetKeyValueStoreService } from "../../../packages/api/src/common/gateway/getKeyValueStore";
import { GetNftResourceManagersService } from "../../../packages/api/src/common/gateway/getNftResourceManagers";
import { GetNonFungibleIdsService } from "../../../packages/api/src/common/gateway/getNonFungibleIds";

// Staking services
import { GetUserStakingPositionsLive } from "../../../packages/api/src/common/staking/getUserStakingPositions";
import { GetLsulpLive } from "../../../packages/api/src/common/dapps/caviarnine/getLsulp";
import { GetLsulpValueLive } from "../../../packages/api/src/common/dapps/caviarnine/getLsulpValue";
import { ConvertLsuToXrdLive } from "../../../packages/api/src/common/staking/convertLsuToXrd";
import { UnstakingReceiptProcessorLive } from "../../../packages/api/src/common/staking/unstakingReceiptProcessor";

// DApp services
import { GetWeftFinancePositionsService } from "../../../packages/api/src/common/dapps/weftFinance/getWeftFinancePositions";
import { GetRootFinancePositionsService } from "../../../packages/api/src/common/dapps/rootFinance/getRootFinancePositions";
import { GetQuantaSwapBinMapLive } from "../../../packages/api/src/common/dapps/caviarnine/getQuantaSwapBinMap";
import { GetShapeLiquidityClaimsLive } from "../../../packages/api/src/common/dapps/caviarnine/getShapeLiquidityClaims";
import { GetShapeLiquidityAssetsLive } from "../../../packages/api/src/common/dapps/caviarnine/getShapeLiquidityAssets";
import { GetOciswapLiquidityAssetsLive } from "../../../packages/api/src/common/dapps/ociswap/getOciswapLiquidityAssets";
import { GetOciswapLiquidityClaimsLive } from "../../../packages/api/src/common/dapps/ociswap/getOciswapLiquidityClaims";
import { GetOciswapResourcePoolPositionsLive } from "../../../packages/api/src/common/dapps/ociswap/getOciswapResourcePoolPositions";
import { GetCaviarnineResourcePoolPositionsLive } from "../../../packages/api/src/common/dapps/caviarnine/getCaviarnineResourcePoolPositions";
import { GetDefiPlazaPositionsLive } from "../../../packages/api/src/common/dapps/defiplaza/getDefiPlazaPositions";
import { GetHyperstakePositionsLive } from "../../../packages/api/src/common/dapps/caviarnine/getHyperstakePositions";
import { GetSurgeLiquidityPositionsLive } from "../../../packages/api/src/common/dapps/surge/getSurgeLiquidityPositions";

// Resource pool services
import { GetResourcePoolUnitsLive } from "../../../packages/api/src/common/resource-pool/getResourcePoolUnits";

// Account and balance services
import { GetAccountAddressesLive } from "../../../packages/api/src/incentives/account/getAccounts";
import { GetAccountBalancesAtStateVersionLive } from "../../../packages/api/src/incentives/account-balance/getAccountBalancesAtStateVersion";
import { UpsertAccountBalancesLive } from "../../../packages/api/src/incentives/account-balance/upsertAccountBalance";
import { AggregateAccountBalanceLive } from "../../../packages/api/src/incentives/account-balance/aggregateAccountBalance";
import { AggregateCaviarninePositionsLive } from "../../../packages/api/src/incentives/account-balance/aggregateCaviarninePositions";
import { AggregateOciswapPositionsLive } from "../../../packages/api/src/incentives/account-balance/aggregateOciswapPositions";
import { AggregateWeftFinancePositionsLive } from "../../../packages/api/src/incentives/account-balance/aggregateWeftFinancePositions";
import { AggregateRootFinancePositionsLive } from "../../../packages/api/src/incentives/account-balance/aggregateRootFinancePositions";
import { AggregateDefiPlazaPositionsLive } from "../../../packages/api/src/incentives/account-balance/aggregateDefiPlazaPositions";
import { AggregateSurgePositionsLive } from "../../../packages/api/src/incentives/account-balance/aggregateSurgePositions";
import { XrdBalanceLive } from "../../../packages/api/src/incentives/account-balance/aggregateXrdBalance";

// Snapshot services
import { CreateSnapshotLive } from "../../../packages/api/src/incentives/snapshot/createSnapshot";
import { UpdateSnapshotLive } from "../../../packages/api/src/incentives/snapshot/updateSnapshot";

// USD and validation services
import { GetUsdValueLive } from "../../../packages/api/src/incentives/token-price/getUsdValue";
import { AddressValidationServiceLive } from "../../../packages/api/src/common/address-validation/addressValidation";

const runnable = Effect.gen(function* () {
  const dbClientLive = createDbClientLive(db);

  const gatewayApiClientLive = GatewayApiClientLive;

  const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getLedgerStateLive = GetLedgerStateService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getAllValidatorsServiceLive = GetAllValidatorsService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const entityFungiblesPageServiceLive =
    EntityFungiblesPageService.Default.pipe(
      Layer.provide(gatewayApiClientLive)
    );

  const stateEntityDetailsLive = GetFungibleBalanceService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive)
  );

  const entityNonFungiblesPageServiceLive =
    EntityNonFungiblesPageService.Default.pipe(
      Layer.provide(gatewayApiClientLive)
    );

  const entityNonFungibleDataServiceLive =
    EntityNonFungibleDataService.Default.pipe(
      Layer.provide(gatewayApiClientLive)
    );

  const getNonFungibleIdsLive = GetNonFungibleIdsService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getNftResourceManagersLive = GetNftResourceManagersService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(getNonFungibleIdsLive)
  );

  const getNonFungibleBalanceLive = GetNonFungibleBalanceService.Default.pipe(
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getNftResourceManagersLive)
  );

  const getUserStakingPositionsLive = GetUserStakingPositionsLive.pipe(
    Layer.provide(getAllValidatorsServiceLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getNonFungibleBalanceLive)
  );

  const getLsulpLive = GetLsulpLive.pipe(
    Layer.provide(entityFungiblesPageServiceLive)
  );

  const convertLsuToXrdLive = ConvertLsuToXrdLive.pipe(
    Layer.provide(getEntityDetailsServiceLive)
  );

  const getLsulpValueLive = GetLsulpValueLive.pipe(
    Layer.provide(entityFungiblesPageServiceLive)
  );

  const getComponentStateServiceLive = GetComponentStateService.Default.pipe(
    Layer.provide(getEntityDetailsServiceLive)
  );

  const keyValueStoreDataServiceLive = KeyValueStoreDataService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const keyValueStoreKeysServiceLive = KeyValueStoreKeysService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getKeyValueStoreServiceLive = GetKeyValueStoreService.Default.pipe(
    Layer.provide(keyValueStoreDataServiceLive),
    Layer.provide(keyValueStoreKeysServiceLive)
  );

  const getFungibleBalanceLive = GetFungibleBalanceService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
    Layer.provide(entityFungiblesPageServiceLive)
  );

  const unstakingReceiptProcessorLive = UnstakingReceiptProcessorLive.pipe(
    Layer.provide(entityNonFungibleDataServiceLive)
  );

  const getWeftFinancePositionsLive =
    GetWeftFinancePositionsService.Default.pipe(
      Layer.provide(getFungibleBalanceLive),
      Layer.provide(getNonFungibleBalanceLive),
      Layer.provide(getKeyValueStoreServiceLive),
      Layer.provide(getComponentStateServiceLive),
      Layer.provide(unstakingReceiptProcessorLive)
    );

  const getRootFinancePositionLive =
    GetRootFinancePositionsService.Default.pipe(
      Layer.provide(getNonFungibleBalanceLive),
      Layer.provide(getKeyValueStoreServiceLive)
    );

  const getQuantaSwapBinMapLive = GetQuantaSwapBinMapLive.pipe(
    Layer.provide(getKeyValueStoreServiceLive)
  );

  const getShapeLiquidityClaimsLive = GetShapeLiquidityClaimsLive.pipe(
    Layer.provide(entityNonFungibleDataServiceLive)
  );

  const getShapeLiquidityAssetsLive = GetShapeLiquidityAssetsLive.pipe(
    Layer.provide(getComponentStateServiceLive),
    Layer.provide(getQuantaSwapBinMapLive),
    Layer.provide(getShapeLiquidityClaimsLive),
    Layer.provide(getNonFungibleBalanceLive)
  );

  const getOciswapLiquidityClaimsLive = GetOciswapLiquidityClaimsLive.pipe(
    Layer.provide(entityNonFungibleDataServiceLive)
  );

  const getOciswapLiquidityAssetsLive = GetOciswapLiquidityAssetsLive.pipe(
    Layer.provide(getComponentStateServiceLive),
    Layer.provide(getOciswapLiquidityClaimsLive),
    Layer.provide(getNonFungibleBalanceLive)
  );

  const getResourcePoolUnitsLive = GetResourcePoolUnitsLive.pipe(
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getEntityDetailsServiceLive)
  );

  const getDefiPlazaPositionsLive = GetDefiPlazaPositionsLive.pipe(
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getResourcePoolUnitsLive)
  );

  const getHyperstakePositionsLive = GetHyperstakePositionsLive.pipe(
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getResourcePoolUnitsLive)
  );

  const getOciswapResourcePoolPositionsLive =
    GetOciswapResourcePoolPositionsLive.pipe(
      Layer.provide(getFungibleBalanceLive),
      Layer.provide(getResourcePoolUnitsLive)
    );

  const getCaviarnineResourcePoolPositionsLive =
    GetCaviarnineResourcePoolPositionsLive.pipe(
      Layer.provide(getFungibleBalanceLive),
      Layer.provide(getResourcePoolUnitsLive)
    );

  const getSurgeLiquidityPositionsLive = GetSurgeLiquidityPositionsLive.pipe(
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getComponentStateServiceLive)
  );

  const getAccountAddressesLive = GetAccountAddressesLive.pipe(
    Layer.provide(dbClientLive)
  );

  const upsertAccountBalancesLive = UpsertAccountBalancesLive.pipe(
    Layer.provide(dbClientLive)
  );

  const createSnapshotLive = CreateSnapshotLive.pipe(
    Layer.provide(dbClientLive)
  );
  const updateSnapshotLive = UpdateSnapshotLive.pipe(
    Layer.provide(dbClientLive)
  );

  const addressValidationServiceLive = AddressValidationServiceLive;

  const getUsdValueLive = GetUsdValueLive.pipe(
    Layer.provide(addressValidationServiceLive)
  );

  const xrdBalanceLive = XrdBalanceLive.pipe(
    Layer.provide(getUsdValueLive),
    Layer.provide(addressValidationServiceLive)
  );

  const aggregateCaviarninePositionsLive =
    AggregateCaviarninePositionsLive.pipe(
      Layer.provide(getUsdValueLive),
      Layer.provide(addressValidationServiceLive)
    );

  const aggregateOciswapPositionsLive = AggregateOciswapPositionsLive.pipe(
    Layer.provide(getUsdValueLive),
    Layer.provide(addressValidationServiceLive)
  );

  const aggregateWeftFinancePositionsLive =
    AggregateWeftFinancePositionsLive.pipe(Layer.provide(getUsdValueLive));

  const aggregateRootFinancePositionsLive =
    AggregateRootFinancePositionsLive.pipe(Layer.provide(getUsdValueLive));

  const aggregateDefiPlazaPositionsLive = AggregateDefiPlazaPositionsLive.pipe(
    Layer.provide(getUsdValueLive),
    Layer.provide(addressValidationServiceLive)
  );

  const aggregateSurgePositionsLive = AggregateSurgePositionsLive.pipe(
    Layer.provide(getUsdValueLive)
  );

  const aggregateAccountBalanceLive = AggregateAccountBalanceLive.pipe(
    Layer.provide(aggregateCaviarninePositionsLive),
    Layer.provide(aggregateOciswapPositionsLive),
    Layer.provide(xrdBalanceLive),
    Layer.provide(aggregateWeftFinancePositionsLive),
    Layer.provide(aggregateRootFinancePositionsLive),
    Layer.provide(aggregateDefiPlazaPositionsLive),
    Layer.provide(aggregateSurgePositionsLive)
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
    getFungibleBalanceLive
  );

  const stakingLive = Layer.mergeAll(
    getUserStakingPositionsLive,
    getLsulpLive,
    convertLsuToXrdLive,
    getLsulpValueLive,
    getAllValidatorsServiceLive
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
    getSurgeLiquidityPositionsLive
  );

  const accountBalanceLive = Layer.mergeAll(
    getAccountAddressesLive,
    upsertAccountBalancesLive,
    updateSnapshotLive
  );

  const getAccountBalancesAtStateVersionLive =
    GetAccountBalancesAtStateVersionLive.pipe(
      Layer.provide(gatewayLive),
      Layer.provide(stakingLive),
      Layer.provide(dappsLive),
      Layer.provide(getFungibleBalanceLive)
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
    Layer.provide(getAllValidatorsServiceLive)
  );

  const service = yield* Effect.provide(SnapshotService, snapshotLive);

  yield* service({
    timestamp: new Date(),
    batchSize: 10000,
  });
});

await Effect.runPromise(runnable.pipe(Effect.provide(Logger.pretty)));

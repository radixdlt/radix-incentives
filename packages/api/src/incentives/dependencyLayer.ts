import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { db, readOnlyDb } from 'db/incentives';
import { Effect, Layer, Logger } from 'effect';
import { AddressValidationServiceLive } from '../common/address-validation/addressValidation';
import { GetCaviarnineResourcePoolPositionsLive } from '../common/dapps/caviarnine/getCaviarnineResourcePoolPositions';
import { GetHyperstakePositionsLive } from '../common/dapps/caviarnine/getHyperstakePositions';
import { GetLsulpLive } from '../common/dapps/caviarnine/getLsulp';
import { GetLsulpValueLive } from '../common/dapps/caviarnine/getLsulpValue';
import { GetQuantaSwapBinMapLive } from '../common/dapps/caviarnine/getQuantaSwapBinMap';
import { GetShapeLiquidityAssetsLive } from '../common/dapps/caviarnine/getShapeLiquidityAssets';
import { GetShapeLiquidityClaimsLive } from '../common/dapps/caviarnine/getShapeLiquidityClaims';
import { GetDefiPlazaPositionsLive } from '../common/dapps/defiplaza/getDefiPlazaPositions';
import { GetOciswapLiquidityAssetsLive } from '../common/dapps/ociswap/getOciswapLiquidityAssets';
import { GetOciswapLiquidityClaimsService } from '../common/dapps/ociswap/getOciswapLiquidityClaims';
import { GetOciswapResourcePoolPositionsLive } from '../common/dapps/ociswap/getOciswapResourcePoolPositions';
import { GetRootFinancePositionsService } from '../common/dapps/rootFinance/getRootFinancePositions';
import { GetSurgeLiquidityPositionsLive } from '../common/dapps/surge/getSurgeLiquidityPositions';
import { GetWeftFinancePositionsService } from '../common/dapps/weftFinance/getWeftFinancePositions';
import { EntityFungiblesPageService } from '../common/gateway/entityFungiblesPage';
import { EntityNonFungibleDataService } from '../common/gateway/entityNonFungiblesData';
import { EntityNonFungiblesPageService } from '../common/gateway/entityNonFungiblesPage';
import { GatewayApiClientLive } from '../common/gateway/gatewayApiClient';
import { GetAddressByNonFungibleService } from '../common/gateway/getAddressByNonFungible';
import { GetAllValidatorsService } from '../common/gateway/getAllValidators';
import { GetComponentStateService } from '../common/gateway/getComponentState';
import { GetEntityDetailsService } from '../common/gateway/getEntityDetails';
import { GetFungibleBalanceService } from '../common/gateway/getFungibleBalance';
import { GetKeyValueStoreService } from '../common/gateway/getKeyValueStore';
import {
  type GetLedgerStateInput,
  GetLedgerStateService,
} from '../common/gateway/getLedgerState';
import { GetNftResourceManagersService } from '../common/gateway/getNftResourceManagers';
import { GetNonFungibleBalanceService } from '../common/gateway/getNonFungibleBalance';
import { GetNonFungibleIdsService } from '../common/gateway/getNonFungibleIds';
import { GetNonFungibleLocationService } from '../common/gateway/getNonFungibleLocation';
import { KeyValueStoreDataService } from '../common/gateway/keyValueStoreData';
import { KeyValueStoreKeysService } from '../common/gateway/keyValueStoreKeys';
import { FetchService } from '../common/helpers/fetch';
import { GetResourcePoolUnitsLive } from '../common/resource-pool/getResourcePoolUnits';
import { ConvertLsuToXrdLive } from '../common/staking/convertLsuToXrd';
import { GetUserStakingPositionsLive } from '../common/staking/getUserStakingPositions';
import { UnstakingReceiptProcessorLive } from '../common/staking/unstakingReceiptProcessor';
import { AccountAddressService } from './account/accountAddressService';
import { GetAccountAddressByUserIdLive } from './account/getAccountAddressByUserId';
import { GetAccountAddressesLive } from './account/getAccounts';
import { GetAccountsIntersectionLive } from './account/getAccountsIntersection';
import { AccountBalanceService } from './account-balance/accountBalance';
import { AggregateAccountBalanceLive } from './account-balance/aggregateAccountBalance';
import { AggregateCaviarninePositionsLive } from './account-balance/aggregateCaviarninePositions';
import { AggregateDefiPlazaPositionsLive } from './account-balance/aggregateDefiPlazaPositions';
import { AggregateOciswapPositionsLive } from './account-balance/aggregateOciswapPositions';
import { AggregatePoolPositionsService } from './account-balance/aggregatePoolPositions';
import { AggregateRootFinancePositionsServiceLive } from './account-balance/aggregateRootFinancePositions';
import { AggregateSurgePositionsLive } from './account-balance/aggregateSurgePositions';
import { AggregateWeftFinancePositionsServiceLive } from './account-balance/aggregateWeftFinancePositions';
import { XrdBalanceLive } from './account-balance/aggregateXrdBalance';
import { GetAccountBalancesAtStateVersionLive } from './account-balance/getAccountBalancesAtStateVersion';
import { UpsertAccountBalancesLive } from './account-balance/upsertAccountBalance';
import { GetActivitiesByWeekIdLive } from './activity/getActivitiesByWeekId';
import { ActivityCategoryWeekService } from './activity-category-week/activityCategoryWeek';
import { CalculateActivityPointsLive } from './activity-points/calculateActivityPoints';
import {
  CalculateActivityPointsWorkerLive,
  CalculateActivityPointsWorkerService,
} from './activity-points/calculateActivityPointsWorker';
import { CalculateTWASQLLive } from './activity-points/calculateTWASQL';
import { UpsertAccountActivityPointsLive } from './activity-points/upsertAccountActivityPoints';
import { ActivityWeekService } from './activity-week/activityWeek';
import { ComponentWhitelistService } from './component/componentWhitelist';
import { GetComponentCallsPaginatedLive } from './component/getComponentCalls';
import { createAppConfigLive, createConfig } from './config/appConfig';
import { ConfigService } from './config/configService';
import { createDbClientLive, createDbReadOnlyClientLive } from './db/dbClient';
import {
  type DeriveAccountFromEventInput,
  DeriveAccountFromEventLive,
  DeriveAccountFromEventService,
} from './events/deriveAccountFromEvent';
import {
  type EventWorkerInput,
  EventWorkerLive,
  EventWorkerService,
} from './events/eventWorker';
import { GetEventsFromDbLive } from './events/queries/getEventsFromDb';
import { LeaderboardCacheService } from './leaderboard/leaderboardCache';
import { GetSeasonByIdLive } from './season/getSeasonById';
import { SeasonService } from './season/season';
import { GetSeasonPointMultiplierService } from './season-point-multiplier/getSeasonPointMultiplier';
import { GetUserTWAXrdBalanceLive } from './season-point-multiplier/getUserTWAXrdBalance';
import {
  SeasonPointsMultiplierWorkerService,
  SeasonPointsMultiplierWorkerServiceLive,
} from './season-point-multiplier/seasonPointsMultiplierWorker';
import { UpsertUserTwaWithMultiplierLive } from './season-point-multiplier/upsertUserTwaWithMultiplier';
import { AddSeasonPointsToUserService } from './season-points/addSeasonPointsToUser';
import { CalculateSeasonPointsService } from './season-points/calculateSeasonPoints';
import { CreateSnapshotLive } from './snapshot/createSnapshot';
import { SnapshotLive } from './snapshot/snapshot';
import {
  type SnapshotWorkerInput,
  SnapshotWorkerLive,
  SnapshotWorkerService,
} from './snapshot/snapshotWorker';
import { UpdateSnapshotLive } from './snapshot/updateSnapshot';
import { GetUsdValueLive } from './token-price/getUsdValue';
import { GetTradingVolumeLive } from './trading-volume/getTradingVolume';
import { GetTransactionFeesPaginatedLive } from './transaction-fee/getTransactionFees';
import { GetUsersPaginatedLive } from './user/getUsersPaginated';
import { UserActivityPointsService } from './user/userActivityPoints';
import { GetWeekByIdLive } from './week/getWeekById';
import { UpdateWeekStatusService } from './week/updateWeekStatus';
import { WeekService } from './week/week';

const appConfig = createConfig();

const dbClientLive = createDbClientLive(db);
const dbReadOnlyClientLive = createDbReadOnlyClientLive(readOnlyDb);

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

const entityFungiblesPageServiceLive = EntityFungiblesPageService.Default.pipe(
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

const getWeftFinancePositionsLive = GetWeftFinancePositionsService.Default.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(getKeyValueStoreServiceLive),
  Layer.provide(getComponentStateServiceLive),
  Layer.provide(unstakingReceiptProcessorLive),
);

const getRootFinancePositionLive = GetRootFinancePositionsService.Default.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(getKeyValueStoreServiceLive),
);

const keyValueStoreDataLive = KeyValueStoreDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const getKeyValueStoreKeysLive = KeyValueStoreKeysService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const getKeyValueStoreLive = GetKeyValueStoreService.Default.pipe(
  Layer.provide(keyValueStoreDataLive),
  Layer.provide(getKeyValueStoreKeysLive),
);

const getEntityDetailsLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const entityNonFungibleDataLive = EntityNonFungibleDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const getComponentStateLive = GetComponentStateService.Default.pipe(
  Layer.provide(getEntityDetailsLive),
);

const getQuantaSwapBinMapLive = GetQuantaSwapBinMapLive.pipe(
  Layer.provide(getKeyValueStoreLive),
);

const getShapeLiquidityClaimsLive = GetShapeLiquidityClaimsLive.pipe(
  Layer.provide(entityNonFungibleDataLive),
);

const getShapeLiquidityAssetsLive = GetShapeLiquidityAssetsLive.pipe(
  Layer.provide(getComponentStateLive),
  Layer.provide(getQuantaSwapBinMapLive),
  Layer.provide(getShapeLiquidityClaimsLive),
  Layer.provide(getNonFungibleBalanceLive),
);

const getOciswapLiquidityClaimsLive =
  GetOciswapLiquidityClaimsService.Default.pipe(
    Layer.provide(entityNonFungibleDataLive),
  );

const getOciswapLiquidityAssetsLive = GetOciswapLiquidityAssetsLive.pipe(
  Layer.provide(getComponentStateLive),
  Layer.provide(getOciswapLiquidityClaimsLive),
  Layer.provide(getNonFungibleBalanceLive),
);

const getAccountAddressesLive = GetAccountAddressesLive.pipe(
  Layer.provide(dbClientLive),
);

const upsertAccountBalancesLive = UpsertAccountBalancesLive.pipe(
  Layer.provide(dbClientLive),
);

const createSnapshotLive = CreateSnapshotLive.pipe(Layer.provide(dbClientLive));
const updateSnapshotLive = UpdateSnapshotLive.pipe(Layer.provide(dbClientLive));

const addressValidationServiceLive = AddressValidationServiceLive;

const getUsdValueLive = GetUsdValueLive.pipe(
  Layer.provide(addressValidationServiceLive),
  Layer.provide(FetchService.Default),
);
const xrdBalanceLive = XrdBalanceLive.pipe(
  Layer.provide(getUsdValueLive),
  Layer.provide(addressValidationServiceLive),
);

const aggregatePoolPositionsLive = AggregatePoolPositionsService.Default.pipe(
  Layer.provide(AddressValidationServiceLive),
  Layer.provide(getUsdValueLive),
);

const aggregateCaviarninePositionsLive = AggregateCaviarninePositionsLive.pipe(
  Layer.provide(aggregatePoolPositionsLive),
);

const aggregateOciswapPositionsLive = AggregateOciswapPositionsLive.pipe(
  Layer.provide(aggregatePoolPositionsLive),
);

const aggregateWeftFinancePositionsLive =
  AggregateWeftFinancePositionsServiceLive.pipe(Layer.provide(getUsdValueLive));

const aggregateRootFinancePositionsLive =
  AggregateRootFinancePositionsServiceLive.pipe(Layer.provide(getUsdValueLive));

const getResourcePoolUnitsLive = GetResourcePoolUnitsLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),
);

const getDefiPlazaPositionsLive = GetDefiPlazaPositionsLive.pipe(
  Layer.provide(aggregatePoolPositionsLive),
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

const aggregateDefiPlazaPositionsLive = AggregateDefiPlazaPositionsLive.pipe(
  Layer.provide(aggregatePoolPositionsLive),
);

const getSurgeLiquidityPositionsLive = GetSurgeLiquidityPositionsLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getComponentStateServiceLive),
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

const configServiceLive = ConfigService.Default.pipe(
  Layer.provide(dbClientLive),
);

const snapshotLive = SnapshotLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getAccountBalancesAtStateVersionLive),
  Layer.provide(accountBalanceLive),
  Layer.provide(createSnapshotLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(dbClientLive),
  Layer.provide(getUsdValueLive),
  Layer.provide(aggregateAccountBalanceLive),
  Layer.provide(getAllValidatorsServiceLive),
  Layer.provide(getResourcePoolUnitsLive),
  Layer.provide(configServiceLive),
  Layer.provide(getLedgerStateLive),
);

const getNonFungibleLocationLive = GetNonFungibleLocationService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
);

const getEventsFromDbLive = GetEventsFromDbLive.pipe(
  Layer.provide(dbClientLive),
);

const getAddressByNonFungibleLive = GetAddressByNonFungibleService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getNonFungibleLocationLive),
);

const getAccountsIntersectionLive = GetAccountsIntersectionLive.pipe(
  Layer.provide(dbClientLive),
);

const deriveAccountFromEventLive = DeriveAccountFromEventLive.pipe(
  Layer.provide(getEventsFromDbLive),
  Layer.provide(getAddressByNonFungibleLive),
  Layer.provide(getAccountsIntersectionLive),
);

const upsertAccountActivityPointsLive = UpsertAccountActivityPointsLive.pipe(
  Layer.provide(dbClientLive),
);

const upsertUserTwaWithMultiplierLive = UpsertUserTwaWithMultiplierLive.pipe(
  Layer.provide(dbClientLive),
);

const getWeekByIdLive = GetWeekByIdLive.pipe(Layer.provide(dbClientLive));

const accountBalanceServiceLive = AccountBalanceService.Default.pipe(
  Layer.provide(dbClientLive),
);

const getTransactionFeesPaginatedLive = GetTransactionFeesPaginatedLive.pipe(
  Layer.provide(dbClientLive),
);

const getAccountAddressByUserIdLive = GetAccountAddressByUserIdLive.pipe(
  Layer.provide(dbClientLive),
);

const componentWhitelistLive = ComponentWhitelistService.Default.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(createAppConfigLive()),
);

const getComponentCallsPaginatedLive = GetComponentCallsPaginatedLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getAccountAddressByUserIdLive),
  Layer.provide(componentWhitelistLive),
);

const getTradingVolumeLive = GetTradingVolumeLive.pipe(
  Layer.provide(dbClientLive),
);

const calculateTWASQLLive = CalculateTWASQLLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(dbReadOnlyClientLive),
);

const calculateActivityPointsLive = CalculateActivityPointsLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(upsertAccountActivityPointsLive),
  Layer.provide(getWeekByIdLive),
  Layer.provide(calculateTWASQLLive),
  Layer.provide(getTransactionFeesPaginatedLive),
  Layer.provide(getComponentCallsPaginatedLive),
  Layer.provide(getTradingVolumeLive),
);

const accountAddressService = AccountAddressService.Default.pipe(
  Layer.provide(dbClientLive),
);

const calculateActivityPointsWorkerLive =
  CalculateActivityPointsWorkerLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(calculateActivityPointsLive),
    Layer.provide(getWeekByIdLive),
    Layer.provide(getTransactionFeesPaginatedLive),
    Layer.provide(accountAddressService),
  );

const getSeasonByIdLive = GetSeasonByIdLive.pipe(Layer.provide(dbClientLive));
const getActivitiesByWeekIdLive = GetActivitiesByWeekIdLive.pipe(
  Layer.provide(dbClientLive),
);
const getUserActivityPointsLive = UserActivityPointsService.Default.pipe(
  Layer.provide(dbClientLive),
);

const getUsersPaginatedLive = GetUsersPaginatedLive.pipe(
  Layer.provide(dbClientLive),
);

const addSeasonPointsToUserLive = AddSeasonPointsToUserService.Default.pipe(
  Layer.provide(dbClientLive),
);
const updateWeekStatusLive = UpdateWeekStatusService.Default.pipe(
  Layer.provide(dbClientLive),
);
const getSeasonPointMultiplierLive =
  GetSeasonPointMultiplierService.Default.pipe(Layer.provide(dbClientLive));

const activityCategoryWeekServiceLive =
  ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive));

const seasonServiceLive = SeasonService.Default.pipe(
  Layer.provide(dbClientLive),
);

const activityWeekServiceLive = ActivityWeekService.Default.pipe(
  Layer.provide(dbClientLive),
);

const weekServiceLive = WeekService.Default.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(activityCategoryWeekServiceLive),
  Layer.provide(activityWeekServiceLive),
);

const calculateSeasonPointsLive = CalculateSeasonPointsService.Default.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getSeasonByIdLive),
  Layer.provide(getWeekByIdLive),
  Layer.provide(getActivitiesByWeekIdLive),
  Layer.provide(getUserActivityPointsLive),
  Layer.provide(getUsersPaginatedLive),
  Layer.provide(addSeasonPointsToUserLive),
  Layer.provide(updateWeekStatusLive),
  Layer.provide(getSeasonPointMultiplierLive),
  Layer.provide(activityCategoryWeekServiceLive),
  Layer.provide(seasonServiceLive),
  Layer.provide(weekServiceLive),
);

const calculateSPMultiplierLive = GetUserTWAXrdBalanceLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getWeekByIdLive),
  Layer.provide(getSeasonByIdLive),
  Layer.provide(getAccountAddressesLive),
  Layer.provide(upsertUserTwaWithMultiplierLive),
  Layer.provide(getActivitiesByWeekIdLive),
  Layer.provide(calculateTWASQLLive),
);

const seasonPointsMultiplierWorkerLive =
  SeasonPointsMultiplierWorkerServiceLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(calculateSPMultiplierLive),
    Layer.provide(getWeekByIdLive),
    Layer.provide(upsertUserTwaWithMultiplierLive),
    Layer.provide(accountBalanceServiceLive),
    Layer.provide(getUsdValueLive),
  );

export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'api' },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: `${appConfig.otlpBaseUrl}/v1/traces`,
    }),
  ),
}));

const snapshotWorkerLive = SnapshotWorkerLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(snapshotLive),
);

const snapshotWorker = (input: SnapshotWorkerInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const snapshotService = yield* SnapshotWorkerService;

      const baseEffect = snapshotService(input).pipe(
        Effect.withSpan('snapshot'),
      );

      return yield* process.env.PRETTY_LOGGING === 'true'
        ? baseEffect.pipe(Effect.provide(Logger.pretty))
        : baseEffect;
    }),
    snapshotWorkerLive,
  );

  return Effect.runPromiseExit(program);
};

const getLedgerState = (input: GetLedgerStateInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const getLedgerStateService = yield* GetLedgerStateService;

      return yield* getLedgerStateService(input);
    }),
    getLedgerStateLive,
  );

  return Effect.runPromiseExit(program);
};

const eventWorkerLive = EventWorkerLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(deriveAccountFromEventLive),
);

const eventWorkerHandler = (input: EventWorkerInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const eventWorkerService = yield* EventWorkerService;

      return yield* eventWorkerService(input);
    }),
    eventWorkerLive,
  );

  return Effect.runPromiseExit(program);
};

const deriveAccountFromEvent = (input: DeriveAccountFromEventInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const deriveAccountFromEventService =
        yield* DeriveAccountFromEventService;

      return yield* deriveAccountFromEventService(input);
    }),
    deriveAccountFromEventLive,
  );

  return Effect.runPromiseExit(program);
};

const calculateActivityPoints = (input: {
  weekId: string;
  useWeekEndDate: boolean;
  addresses?: string[];
}) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const calculateActivityPointsWorkerService =
        yield* CalculateActivityPointsWorkerService;

      return yield* calculateActivityPointsWorkerService.run({
        weekId: input.weekId,
        useWeekEndDate: input.useWeekEndDate,
        addresses: input.addresses,
      });
    }),
    calculateActivityPointsWorkerLive,
  ).pipe(
    Effect.withSpan('calculateActivityPoints'),
    Effect.provide(NodeSdkLive),
  );

  return Effect.runPromiseExit(program);
};

const calculateSeasonPoints = (input: {
  weekId: string;
  markAsProcessed?: boolean;
}) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const calculateSeasonPointsService = yield* CalculateSeasonPointsService;

      return yield* calculateSeasonPointsService.run({
        ...input,
        markAsProcessed: !!input.markAsProcessed,
      });
    }),
    calculateSeasonPointsLive,
  );

  return Effect.runPromiseExit(program);
};

const calculateSPMultiplier = (input: {
  weekId: string;
  userIds?: string[];
}) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const calculateSPMultiplierWorkerService =
        yield* SeasonPointsMultiplierWorkerService;

      return yield* calculateSPMultiplierWorkerService(input);
    }),
    seasonPointsMultiplierWorkerLive,
  ).pipe(Effect.provide(NodeSdkLive));

  return Effect.runPromiseExit(program);
};

const getWeekByDate = (date: Date) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const weekService = yield* WeekService;

      return yield* weekService.getByDate(date);
    }),
    weekServiceLive,
  );

  return Effect.runPromiseExit(program);
};

const getSeasonByWeekId = (weekId: string) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const seasonService = yield* SeasonService;

      return yield* seasonService.getByWeekId(weekId);
    }),
    SeasonService.Default.pipe(Layer.provide(dbClientLive)),
  );

  return Effect.runPromiseExit(program);
};

const populateLeaderboardCache = (input: { weekId?: string }) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const leaderboardCacheService = yield* LeaderboardCacheService;
      return yield* leaderboardCacheService.populateAll(input);
    }),
    LeaderboardCacheService.Default.pipe(
      Layer.provide(dbClientLive),
      Layer.provide(SeasonService.Default.pipe(Layer.provide(dbClientLive))),
      Layer.provide(weekServiceLive),
      Layer.provide(
        ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive)),
      ),
      Layer.provide(activityWeekServiceLive),
    ),
  );

  return Effect.runPromiseExit(program);
};

const getUnprocessedWeeks = () => {
  const runnable = Effect.gen(function* () {
    const weekService = yield* WeekService;
    return yield* weekService.getUnprocessedWeeks();
  }).pipe(Effect.provide(weekServiceLive));

  return Effect.runPromiseExit(runnable);
};

export const dependencyLayer = {
  snapshotWorker,
  getLedgerState,
  deriveAccountFromEvent,
  calculateActivityPoints,
  calculateSeasonPoints,
  calculateSPMultiplier,
  eventWorkerHandler,
  getWeekByDate,
  getSeasonByWeekId,
  populateLeaderboardCache,
  getUnprocessedWeeks,
};

import { Effect, Layer, Logger } from "effect";
import { GatewayApiClientLive } from "../common/gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../common/gateway/getEntityDetails";

import {
  type GetLedgerStateInput,
  GetLedgerStateLive,
  GetLedgerStateService,
} from "../common/gateway/getLedgerState";
import { GetFungibleBalanceLive } from "../common/gateway/getFungibleBalance";
import { EntityFungiblesPageLive } from "../common/gateway/entityFungiblesPage";
import { EntityNonFungiblesPageLive } from "../common/gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataService } from "../common/gateway/entityNonFungiblesData";
import { GetNonFungibleBalanceLive } from "../common/gateway/getNonFungibleBalance";
import { GetAllValidatorsLive } from "../common/gateway/getAllValidators";
import { GetAccountBalancesAtStateVersionLive } from "./account-balance/getAccountBalancesAtStateVersion";
import { GetUserStakingPositionsLive } from "../common/staking/getUserStakingPositions";
import { GetLsulpLive } from "../common/dapps/caviarnine/getLsulp";
import { GetLsulpValueLive } from "../common/dapps/caviarnine/getLsulpValue";
import { ConvertLsuToXrdLive } from "../common/staking/convertLsuToXrd";
import { GetWeftFinancePositionsService } from "../common/dapps/weftFinance/getWeftFinancePositions";
import { UnstakingReceiptProcessorLive } from "../common/staking/unstakingReceiptProcessor";
import { GetComponentStateLive } from "../common/gateway/getComponentState";
import { KeyValueStoreDataLive } from "../common/gateway/keyValueStoreData";
import { KeyValueStoreKeysLive } from "../common/gateway/keyValueStoreKeys";
import { GetKeyValueStoreService } from "../common/gateway/getKeyValueStore";
import { GetRootFinancePositionsService } from "../common/dapps/rootFinance/getRootFinancePositions";
import { GetQuantaSwapBinMapLive } from "../common/dapps/caviarnine/getQuantaSwapBinMap";
import { GetShapeLiquidityClaimsLive } from "../common/dapps/caviarnine/getShapeLiquidityClaims";
import { GetShapeLiquidityAssetsLive } from "../common/dapps/caviarnine/getShapeLiquidityAssets";
import { GetOciswapLiquidityAssetsLive } from "../common/dapps/ociswap/getOciswapLiquidityAssets";
import { GetOciswapLiquidityClaimsLive } from "../common/dapps/ociswap/getOciswapLiquidityClaims";
import { GetOciswapResourcePoolPositionsLive } from "../common/dapps/ociswap/getOciswapResourcePoolPositions";
import { GetCaviarnineResourcePoolPositionsLive } from "../common/dapps/caviarnine/getCaviarnineResourcePoolPositions";
import { GetDefiPlazaPositionsLive } from "../common/dapps/defiplaza/getDefiPlazaPositions";
import { GetHyperstakePositionsLive } from "../common/dapps/caviarnine/getHyperstakePositions";
import { GetResourcePoolUnitsLive } from "../common/resource-pool/getResourcePoolUnits";
import { SnapshotLive } from "./snapshot/snapshot";
import { GetAccountAddressesLive } from "./account/getAccounts";
import { UpsertAccountBalancesLive } from "./account-balance/upsertAccountBalance";
import { CreateSnapshotLive } from "./snapshot/createSnapshot";
import { UpdateSnapshotLive } from "./snapshot/updateSnapshot";
import { createDbClientLive, createDbReadOnlyClientLive } from "./db/dbClient";
import { db, readOnlyDb } from "db/incentives";
import { GetUsdValueLive } from "./token-price/getUsdValue";
import { AggregateAccountBalanceLive } from "./account-balance/aggregateAccountBalance";
import { AggregateCaviarninePositionsLive } from "./account-balance/aggregateCaviarninePositions";
import { AggregateOciswapPositionsLive } from "./account-balance/aggregateOciswapPositions";
import { createAppConfigLive, createConfig } from "./config/appConfig";
import {
  type DeriveAccountFromEventInput,
  DeriveAccountFromEventLive,
  DeriveAccountFromEventService,
} from "./events/deriveAccountFromEvent";
import { GetNonFungibleLocationLive } from "../common/gateway/getNonFungibleLocation";
import { GetEventsFromDbLive } from "./events/queries/getEventsFromDb";
import { GetAddressByNonFungibleLive } from "../common/gateway/getAddressByNonFungible";
import { GetAccountsIntersectionLive } from "./account/getAccountsIntersection";
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { GetNftResourceManagersLive } from "../common/gateway/getNftResourceManagers";
import { GetNonFungibleIdsLive } from "../common/gateway/getNonFungibleIds";
import { CalculateActivityPointsLive } from "./activity-points/calculateActivityPoints";
import { CalculateTWASQLLive } from "./activity-points/calculateTWASQL";
import { UpsertAccountActivityPointsLive } from "./activity-points/upsertAccountActivityPoints";
import { GetWeekByIdLive } from "./week/getWeekById";
import { AccountBalanceService } from "./account-balance/accountBalance";
import {
  CalculateActivityPointsWorkerLive,
  CalculateActivityPointsWorkerService,
} from "./activity-points/calculateActivityPointsWorker";
import { CalculateSeasonPointsService } from "./season-points/calculateSeasonPoints";
import { GetSeasonByIdLive } from "./season/getSeasonById";
import { GetActivitiesByWeekIdLive } from "./activity/getActivitiesByWeekId";
import { UserActivityPointsService } from "./user/userActivityPoints";
import { GetUsersPaginatedLive } from "./user/getUsersPaginated";
import { UpdateWeekStatusService } from "./week/updateWeekStatus";
import { AddSeasonPointsToUserService } from "./season-points/addSeasonPointsToUser";
import { XrdBalanceLive } from "./account-balance/aggregateXrdBalance";
import {
  SeasonPointsMultiplierWorkerLive,
  SeasonPointsMultiplierWorkerService,
} from "./season-point-multiplier/seasonPointsMultiplierWorker";
import { GetUserTWAXrdBalanceLive } from "./season-point-multiplier/getUserTWAXrdBalance";
import { UpsertUserTwaWithMultiplierLive } from "./season-point-multiplier/upsertUserTwaWithMultiplier";
import { GetSeasonPointMultiplierService } from "./season-point-multiplier/getSeasonPointMultiplier";

import { AggregateWeftFinancePositionsLive } from "./account-balance/aggregateWeftFinancePositions";
import { AggregateRootFinancePositionsLive } from "./account-balance/aggregateRootFinancePositions";
import { AggregateDefiPlazaPositionsLive } from "./account-balance/aggregateDefiPlazaPositions";
import { GetSurgeLiquidityPositionsLive } from "../common/dapps/surge/getSurgeLiquidityPositions";
import { AggregateSurgePositionsLive } from "./account-balance/aggregateSurgePositions";
import { GetTransactionFeesPaginatedLive } from "./transaction-fee/getTransactionFees";
import { GetComponentCallsPaginatedLive } from "./component/getComponentCalls";
import { GetTradingVolumeLive } from "./trading-volume/getTradingVolume";
import { AddressValidationServiceLive } from "../common/address-validation/addressValidation";
import {
  type EventWorkerInput,
  EventWorkerLive,
  EventWorkerService,
} from "./events/eventWorker";
import { GetAccountAddressByUserIdLive } from "./account/getAccountAddressByUserId";
import {
  type SnapshotWorkerInput,
  SnapshotWorkerLive,
  SnapshotWorkerService,
} from "./snapshot/snapshotWorker";
import { AccountAddressService } from "./account/accountAddressService";
import { WeekService } from "./week/week";
import { ActivityCategoryWeekService } from "./activity-category-week/activityCategoryWeek";
import { SeasonService } from "./season/season";
const appConfig = createConfig();

const appConfigServiceLive = createAppConfigLive(appConfig);

const dbClientLive = createDbClientLive(db);
const dbReadOnlyClientLive = createDbReadOnlyClientLive(readOnlyDb);

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getLedgerStateLive = GetLedgerStateLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getAllValidatorsServiceLive = GetAllValidatorsLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const stateEntityDetailsLive = GetFungibleBalanceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive)
);

const entityNonFungiblesPageServiceLive = EntityNonFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungibleDataServiceLive =
  EntityNonFungibleDataService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

const getNonFungibleIdsLive = GetNonFungibleIdsLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getNftResourceManagersLive = GetNftResourceManagersLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getNonFungibleIdsLive)
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
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

const getComponentStateServiceLive = GetComponentStateLive.pipe(
  Layer.provide(getEntityDetailsServiceLive)
);

const keyValueStoreDataServiceLive = KeyValueStoreDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const keyValueStoreKeysServiceLive = KeyValueStoreKeysLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreServiceLive = GetKeyValueStoreService.Default.pipe(
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
);

const getFungibleBalanceLive = GetFungibleBalanceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive)
);

const unstakingReceiptProcessorLive = UnstakingReceiptProcessorLive.pipe(
  Layer.provide(entityNonFungibleDataServiceLive)
);

const getWeftFinancePositionsLive = GetWeftFinancePositionsService.Default.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(getKeyValueStoreServiceLive),
  Layer.provide(getComponentStateServiceLive),
  Layer.provide(unstakingReceiptProcessorLive)
);

const getRootFinancePositionLive = GetRootFinancePositionsService.Default.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(getKeyValueStoreServiceLive)
);

const keyValueStoreDataLive = KeyValueStoreDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreKeysLive = KeyValueStoreKeysLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreLive = GetKeyValueStoreService.Default.pipe(
  Layer.provide(keyValueStoreDataLive),
  Layer.provide(getKeyValueStoreKeysLive)
);

const getEntityDetailsLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungibleDataLive = EntityNonFungibleDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getComponentStateLive = GetComponentStateLive.pipe(
  Layer.provide(getEntityDetailsLive)
);

const getQuantaSwapBinMapLive = GetQuantaSwapBinMapLive.pipe(
  Layer.provide(getKeyValueStoreLive)
);

const getShapeLiquidityClaimsLive = GetShapeLiquidityClaimsLive.pipe(
  Layer.provide(entityNonFungibleDataLive)
);

const getShapeLiquidityAssetsLive = GetShapeLiquidityAssetsLive.pipe(
  Layer.provide(getComponentStateLive),
  Layer.provide(getQuantaSwapBinMapLive),
  Layer.provide(getShapeLiquidityClaimsLive),
  Layer.provide(getNonFungibleBalanceLive)
);

const getOciswapLiquidityClaimsLive = GetOciswapLiquidityClaimsLive.pipe(
  Layer.provide(entityNonFungibleDataLive)
);

const getOciswapLiquidityAssetsLive = GetOciswapLiquidityAssetsLive.pipe(
  Layer.provide(getComponentStateLive),
  Layer.provide(getOciswapLiquidityClaimsLive),
  Layer.provide(getNonFungibleBalanceLive)
);

const getAccountAddressesLive = GetAccountAddressesLive.pipe(
  Layer.provide(dbClientLive)
);

const upsertAccountBalancesLive = UpsertAccountBalancesLive.pipe(
  Layer.provide(dbClientLive)
);

const createSnapshotLive = CreateSnapshotLive.pipe(Layer.provide(dbClientLive));
const updateSnapshotLive = UpdateSnapshotLive.pipe(Layer.provide(dbClientLive));

const addressValidationServiceLive = AddressValidationServiceLive;

const getUsdValueLive = GetUsdValueLive.pipe(
  Layer.provide(addressValidationServiceLive)
);
const xrdBalanceLive = XrdBalanceLive.pipe(
  Layer.provide(getUsdValueLive),
  Layer.provide(addressValidationServiceLive)
);

const aggregateCaviarninePositionsLive = AggregateCaviarninePositionsLive.pipe(
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

const aggregateDefiPlazaPositionsLive = AggregateDefiPlazaPositionsLive.pipe(
  Layer.provide(getUsdValueLive),
  Layer.provide(addressValidationServiceLive)
);

const getSurgeLiquidityPositionsLive = GetSurgeLiquidityPositionsLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getComponentStateServiceLive)
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

const snapshotLive = SnapshotLive.pipe(
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

const getNonFungibleLocationLive = GetNonFungibleLocationLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getEventsFromDbLive = GetEventsFromDbLive.pipe(
  Layer.provide(dbClientLive)
);

const getAddressByNonFungibleLive = GetAddressByNonFungibleLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getNonFungibleLocationLive)
);

const getAccountsIntersectionLive = GetAccountsIntersectionLive.pipe(
  Layer.provide(dbClientLive)
);

const deriveAccountFromEventLive = DeriveAccountFromEventLive.pipe(
  Layer.provide(getEventsFromDbLive),
  Layer.provide(getAddressByNonFungibleLive),
  Layer.provide(getAccountsIntersectionLive)
);

const upsertAccountActivityPointsLive = UpsertAccountActivityPointsLive.pipe(
  Layer.provide(dbClientLive)
);

const upsertUserTwaWithMultiplierLive = UpsertUserTwaWithMultiplierLive.pipe(
  Layer.provide(dbClientLive)
);

const getWeekByIdLive = GetWeekByIdLive.pipe(Layer.provide(dbClientLive));

const accountBalanceServiceLive = AccountBalanceService.Default.pipe(
  Layer.provide(dbClientLive)
);

const getTransactionFeesPaginatedLive = GetTransactionFeesPaginatedLive.pipe(
  Layer.provide(dbClientLive)
);

const getAccountAddressByUserIdLive = GetAccountAddressByUserIdLive.pipe(
  Layer.provide(dbClientLive)
);

const getComponentCallsPaginatedLive = GetComponentCallsPaginatedLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getAccountAddressByUserIdLive)
);

const getTradingVolumeLive = GetTradingVolumeLive.pipe(
  Layer.provide(dbClientLive)
);

const calculateTWASQLLive = CalculateTWASQLLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(dbReadOnlyClientLive)
);

const calculateActivityPointsLive = CalculateActivityPointsLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(upsertAccountActivityPointsLive),
  Layer.provide(getWeekByIdLive),
  Layer.provide(calculateTWASQLLive),
  Layer.provide(getTransactionFeesPaginatedLive),
  Layer.provide(getComponentCallsPaginatedLive),
  Layer.provide(getTradingVolumeLive)
);

const accountAddressService = AccountAddressService.Default.pipe(
  Layer.provide(dbClientLive)
);

const calculateActivityPointsWorkerLive =
  CalculateActivityPointsWorkerLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(calculateActivityPointsLive),
    Layer.provide(getWeekByIdLive),
    Layer.provide(getTransactionFeesPaginatedLive),
    Layer.provide(accountAddressService)
  );

const getSeasonByIdLive = GetSeasonByIdLive.pipe(Layer.provide(dbClientLive));
const getActivitiesByWeekIdLive = GetActivitiesByWeekIdLive.pipe(
  Layer.provide(dbClientLive)
);
const getUserActivityPointsLive = UserActivityPointsService.Default.pipe(
  Layer.provide(dbClientLive)
);

const getUsersPaginatedLive = GetUsersPaginatedLive.pipe(
  Layer.provide(dbClientLive)
);

const addSeasonPointsToUserLive = AddSeasonPointsToUserService.Default.pipe(
  Layer.provide(dbClientLive)
);
const updateWeekStatusLive = UpdateWeekStatusService.Default.pipe(
  Layer.provide(dbClientLive)
);
const getSeasonPointMultiplierLive =
  GetSeasonPointMultiplierService.Default.pipe(Layer.provide(dbClientLive));

const activityCategoryWeekServiceLive =
  ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive));

const seasonServiceLive = SeasonService.Default.pipe(
  Layer.provide(dbClientLive)
);

const weekServiceLive = WeekService.Default.pipe(Layer.provide(dbClientLive));

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
  Layer.provide(weekServiceLive)
);

const calculateSPMultiplierLive = GetUserTWAXrdBalanceLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getWeekByIdLive),
  Layer.provide(getSeasonByIdLive),
  Layer.provide(getAccountAddressesLive),
  Layer.provide(upsertUserTwaWithMultiplierLive),
  Layer.provide(getActivitiesByWeekIdLive),
  Layer.provide(calculateTWASQLLive)
);

const seasonPointsMultiplierWorkerLive = SeasonPointsMultiplierWorkerLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(calculateSPMultiplierLive),
  Layer.provide(getWeekByIdLive),
  Layer.provide(upsertUserTwaWithMultiplierLive),
  Layer.provide(accountBalanceServiceLive)
);

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "api" },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: `${appConfig.otlpBaseUrl}/v1/traces`,
    })
  ),
}));

const snapshotWorkerLive = SnapshotWorkerLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(snapshotLive),
  Layer.provide(calculateActivityPointsLive)
);

const snapshotWorker = (input: SnapshotWorkerInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const snapshotService = yield* SnapshotWorkerService;

      const baseEffect = snapshotService(input).pipe(
        Effect.withSpan("snapshot")
      );

      return yield* process.env.PRETTY_LOGGING === "true"
        ? baseEffect.pipe(Effect.provide(Logger.pretty))
        : baseEffect;
    }),
    snapshotWorkerLive
  );

  return Effect.runPromiseExit(program);
};

const getLedgerState = (input: GetLedgerStateInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const getLedgerStateService = yield* GetLedgerStateService;

      return yield* getLedgerStateService.run(input);
    }),
    getLedgerStateLive
  );

  return Effect.runPromiseExit(program);
};

const eventWorkerLive = EventWorkerLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(deriveAccountFromEventLive)
);

const eventWorkerHandler = (input: EventWorkerInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const eventWorkerService = yield* EventWorkerService;

      return yield* eventWorkerService(input);
    }),
    eventWorkerLive
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
    deriveAccountFromEventLive
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
    calculateActivityPointsWorkerLive
  ).pipe(
    Effect.withSpan("calculateActivityPoints"),
    Effect.provide(NodeSdkLive)
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
    calculateSeasonPointsLive
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
    seasonPointsMultiplierWorkerLive
  ).pipe(Effect.provide(NodeSdkLive));

  return Effect.runPromiseExit(program);
};

const getWeekByDate = (date: Date) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const weekService = yield* WeekService;

      return yield* weekService.getByDate(date);
    }),
    WeekService.Default.pipe(Layer.provide(dbClientLive))
  );

  return Effect.runPromiseExit(program);
};

const getSeasonByWeekId = (weekId: string) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const seasonService = yield* SeasonService;

      return yield* seasonService.getByWeekId(weekId);
    }),
    SeasonService.Default.pipe(Layer.provide(dbClientLive))
  );

  return Effect.runPromiseExit(program);
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
};

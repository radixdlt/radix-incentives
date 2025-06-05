import { Effect, Layer } from "effect";
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
import { EntityNonFungibleDataLive } from "../common/gateway/entityNonFungiblesData";
import { GetNonFungibleBalanceLive } from "../common/gateway/getNonFungibleBalance";
import { GetAllValidatorsLive } from "../common/gateway/getAllValidators";
import { GetAccountBalancesAtStateVersionLive } from "./account-balance/getAccountBalancesAtStateVersion";
import { GetUserStakingPositionsLive } from "../common/staking/getUserStakingPositions";
import { GetLsulpLive } from "../common/dapps/caviarnine/getLsulp";
import { GetLsulpValueLive } from "../common/dapps/caviarnine/getLsulpValue";
import { ConvertLsuToXrdLive } from "../common/staking/convertLsuToXrd";
import { GetWeftFinancePositionsLive } from "../common/dapps/weftFinance/getWeftFinancePositions";
import { GetComponentStateLive } from "../common/gateway/getComponentState";
import { KeyValueStoreDataLive } from "../common/gateway/keyValueStoreData";
import { KeyValueStoreKeysLive } from "../common/gateway/keyValueStoreKeys";
import { GetKeyValueStoreLive } from "../common/gateway/getKeyValueStore";
import { GetRootFinancePositionsLive } from "../common/dapps/rootFinance/getRootFinancePositions";
import { GetQuantaSwapBinMapLive } from "../common/dapps/caviarnine/getQuantaSwapBinMap";
import { GetShapeLiquidityClaimsLive } from "../common/dapps/caviarnine/getShapeLiquidityClaims";
import { GetShapeLiquidityAssetsLive } from "../common/dapps/caviarnine/getShapeLiquidityAssets";
import {
  SnapshotService,
  SnapshotLive,
  type SnapshotInput,
} from "./snapshot/snapshot";
import { GetAccountAddressesLive } from "./account/getAccounts";
import { UpsertAccountBalancesLive } from "./account-balance/upsertAccountBalance";
import { CreateSnapshotLive } from "./snapshot/createSnapshot";
import { UpdateSnapshotLive } from "./snapshot/updateSnapshot";
import { createDbClientLive } from "./db/dbClient";
import { db } from "db/incentives";
import { GetUsdValueLive } from "./token-price/getUsdValue";
import { AggregateAccountBalanceLive } from "./account-balance/aggregateAccountBalance";
import { AggregateCaviarninePositionsLive } from "./account-balance/aggregateCaviarninePositions";
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

const appConfig = createConfig();
const appConfigServiceLive = createAppConfigLive(appConfig);

const dbClientLive = createDbClientLive(db);

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

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
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const entityNonFungiblesPageServiceLive = EntityNonFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungibleDataServiceLive = EntityNonFungibleDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getNonFungibleIdsLive = GetNonFungibleIdsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive)
);

const getNftResourceManagersLive = GetNftResourceManagersLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleIdsLive)
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(getNftResourceManagersLive)
);

const getUserStakingPositionsLive = GetUserStakingPositionsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(getAllValidatorsServiceLive)
);

const getLsulpLive = GetLsulpLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const convertLsuToXrdServiceLive = ConvertLsuToXrdLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const convertLsuToXrdLive = ConvertLsuToXrdLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getLsulpValueLive = GetLsulpValueLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getComponentStateServiceLive = GetComponentStateLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(appConfigServiceLive)
);

const keyValueStoreDataServiceLive = KeyValueStoreDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const keyValueStoreKeysServiceLive = KeyValueStoreKeysLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreServiceLive = GetKeyValueStoreLive.pipe(
  Layer.provide(gatewayApiClientLive),

  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
);

const getFungibleBalanceLive = GetFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),

  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getWeftFinancePositionsLive = GetWeftFinancePositionsLive.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(getComponentStateServiceLive),
  Layer.provide(getKeyValueStoreServiceLive)
);

const getRootFinancePositionLive = GetRootFinancePositionsLive.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(entityNonFungiblesPageServiceLive)
);

const keyValueStoreDataLive = KeyValueStoreDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreKeysLive = KeyValueStoreKeysLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreLive = GetKeyValueStoreLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(keyValueStoreDataLive),
  Layer.provide(getKeyValueStoreKeysLive)
);

const getEntityDetailsLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungibleDataLive = EntityNonFungibleDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getComponentStateLive = GetComponentStateLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getEntityDetailsLive)
);

const getQuantaSwapBinMapLive = GetQuantaSwapBinMapLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(getEntityDetailsLive),
  Layer.provide(getKeyValueStoreLive),
  Layer.provide(getComponentStateLive)
);

const getShapeLiquidityClaimsLive = GetShapeLiquidityClaimsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getEntityDetailsLive),
  Layer.provide(entityNonFungibleDataLive)
);

const getShapeLiquidityAssetsLive = GetShapeLiquidityAssetsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(getEntityDetailsLive),
  Layer.provide(entityNonFungibleDataLive),
  Layer.provide(getKeyValueStoreLive),
  Layer.provide(getComponentStateLive),
  Layer.provide(getQuantaSwapBinMapLive),
  Layer.provide(getShapeLiquidityClaimsLive),
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

const getUsdValueLive = GetUsdValueLive.pipe(Layer.provide(dbClientLive));

const aggregateCaviarninePositionsLive = AggregateCaviarninePositionsLive.pipe(
  Layer.provide(getUsdValueLive)
);

const aggregateAccountBalanceLive = AggregateAccountBalanceLive.pipe(
  Layer.provide(getUsdValueLive),
  Layer.provide(aggregateCaviarninePositionsLive)
);

const c9Layers = Layer.mergeAll(
  getShapeLiquidityAssetsLive,
  getShapeLiquidityClaimsLive,
  getQuantaSwapBinMapLive
);

const getAccountBalancesAtStateVersionLive =
  GetAccountBalancesAtStateVersionLive.pipe(
    Layer.provide(stateEntityDetailsLive),
    Layer.provide(entityFungiblesPageServiceLive),
    Layer.provide(getLedgerStateLive),
    Layer.provide(entityNonFungiblesPageServiceLive),
    Layer.provide(entityNonFungibleDataServiceLive),
    Layer.provide(getNonFungibleBalanceLive),
    Layer.provide(getAllValidatorsServiceLive),
    Layer.provide(getUserStakingPositionsLive),
    Layer.provide(getLsulpLive),
    Layer.provide(convertLsuToXrdLive),
    Layer.provide(getLsulpValueLive),
    Layer.provide(getEntityDetailsServiceLive),
    Layer.provide(getWeftFinancePositionsLive),
    Layer.provide(getRootFinancePositionLive),
    Layer.provide(c9Layers),
    Layer.provide(getAccountAddressesLive),
    Layer.provide(upsertAccountBalancesLive),
    Layer.provide(updateSnapshotLive),
    Layer.provide(getNftResourceManagersLive),
    Layer.provide(getNonFungibleIdsLive)
  );

const snapshotLive = SnapshotLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getAccountBalancesAtStateVersionLive),
  Layer.provide(upsertAccountBalancesLive),
  Layer.provide(updateSnapshotLive),
  Layer.provide(createSnapshotLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(dbClientLive),
  Layer.provide(getAccountAddressesLive),
  Layer.provide(getUsdValueLive),
  Layer.provide(aggregateAccountBalanceLive)
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
  Layer.provide(dbClientLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getNonFungibleLocationLive),
  Layer.provide(getEventsFromDbLive),
  Layer.provide(getAddressByNonFungibleLive),
  Layer.provide(getAccountsIntersectionLive)
);

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "api" },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: `${appConfig.otlpBaseUrl}/v1/traces`,
    })
  ),
}));

const snapshotProgram = (input: SnapshotInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const snapshotService = yield* SnapshotService;

      return yield* snapshotService(input).pipe(Effect.withSpan("snapshot"));
    }),
    Layer.mergeAll(
      getAccountBalancesAtStateVersionLive,
      gatewayApiClientLive,
      stateEntityDetailsLive,
      entityFungiblesPageServiceLive,
      entityNonFungibleDataServiceLive,
      getNonFungibleBalanceLive,
      getAllValidatorsServiceLive,
      getUserStakingPositionsLive,
      getLsulpLive,
      getLsulpValueLive,
      convertLsuToXrdLive,
      getEntityDetailsServiceLive,
      getWeftFinancePositionsLive,
      getKeyValueStoreServiceLive,
      keyValueStoreDataServiceLive,
      keyValueStoreKeysServiceLive,
      getRootFinancePositionLive,
      getShapeLiquidityAssetsLive,
      getLedgerStateLive,
      getEntityDetailsLive,
      entityNonFungibleDataLive,
      entityNonFungiblesPageServiceLive,
      getKeyValueStoreLive,
      getKeyValueStoreKeysLive,
      keyValueStoreDataLive,
      getComponentStateLive,
      getQuantaSwapBinMapLive,
      getShapeLiquidityClaimsLive,
      snapshotLive,
      getLedgerStateLive,
      getAccountBalancesAtStateVersionLive,
      getAccountAddressesLive,
      dbClientLive,
      upsertAccountBalancesLive,
      updateSnapshotLive,
      createSnapshotLive,
      getUsdValueLive,
      aggregateCaviarninePositionsLive,
      aggregateAccountBalanceLive,
      getNftResourceManagersLive,
      getNonFungibleIdsLive
    )
  ).pipe(Effect.provide(NodeSdkLive));

  return Effect.runPromiseExit(program);
};

const getLedgerState = (input: GetLedgerStateInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const getLedgerStateService = yield* GetLedgerStateService;

      return yield* getLedgerStateService(input);
    }),
    Layer.mergeAll(getLedgerStateLive, gatewayApiClientLive)
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
    Layer.mergeAll(
      getNonFungibleLocationLive,
      getEventsFromDbLive,
      dbClientLive,
      gatewayApiClientLive,
      getAccountsIntersectionLive,
      deriveAccountFromEventLive
    )
  );

  return Effect.runPromiseExit(program);
};

export const dependencyLayer = {
  snapshot: snapshotProgram,
  getLedgerState,
  deriveAccountFromEvent,
};

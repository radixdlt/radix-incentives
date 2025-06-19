import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../common/gateway/getEntityDetails";
import { createAppConfigLive } from "../config/appConfig";
import { GetLedgerStateLive } from "../../common/gateway/getLedgerState";
import { GetFungibleBalanceLive } from "../../common/gateway/getFungibleBalance";
import { EntityFungiblesPageLive } from "../../common/gateway/entityFungiblesPage";
import { EntityNonFungiblesPageLive } from "../../common/gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataLive } from "../../common/gateway/entityNonFungiblesData";
import { GetNonFungibleBalanceLive } from "../../common/gateway/getNonFungibleBalance";
import { GetAllValidatorsLive } from "../../common/gateway/getAllValidators";
import { accounts } from "../../fixtures/accounts";
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  GetAccountBalancesAtStateVersionLive,
  GetAccountBalancesAtStateVersionService,
} from "./getAccountBalancesAtStateVersion";
import { GetAllValidatorsService } from "../../common/gateway/getAllValidators";
import { GetUserStakingPositionsLive } from "../../common/staking/getUserStakingPositions";
import { GetLsulpLive } from "../../common/dapps/caviarnine/getLsulp";
import { GetLsulpValueLive } from "../../common/dapps/caviarnine/getLsulpValue";
import { ConvertLsuToXrdLive } from "../../common/staking/convertLsuToXrd";
import { catchAll } from "effect/Effect";
import { GetWeftFinancePositionsLive } from "../../common/dapps/weftFinance/getWeftFinancePositions";
import { GetComponentStateLive } from "../../common/gateway/getComponentState";
import { KeyValueStoreDataLive } from "../../common/gateway/keyValueStoreData";
import { KeyValueStoreKeysLive } from "../../common/gateway/keyValueStoreKeys";
import { GetKeyValueStoreLive } from "../../common/gateway/getKeyValueStore";
import { GetRootFinancePositionsLive } from "../../common/dapps/rootFinance/getRootFinancePositions";
import { GetQuantaSwapBinMapLive } from "../../common/dapps/caviarnine/getQuantaSwapBinMap";
import { GetShapeLiquidityClaimsLive } from "../../common/dapps/caviarnine/getShapeLiquidityClaims";
import { GetShapeLiquidityAssetsLive } from "../../common/dapps/caviarnine/getShapeLiquidityAssets";
import { GetDefiPlazaPositionsLive } from "../../common/dapps/defiplaza/getDefiPlazaPositions";
import { GetResourcePoolUnitsLive } from "../../common/resource-pool/getResourcePoolUnits";
import { GetNftResourceManagersLive } from "../../common/gateway/getNftResourceManagers";
import { GetNonFungibleIdsLive } from "../../common/gateway/getNonFungibleIds";

const appConfigServiceLive = createAppConfigLive();

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
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getKeyValueStoreServiceLive),
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
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

const getResourcePoolUnitsLive = GetResourcePoolUnitsLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive)
);

const getDefiPlazaPositionsLive = GetDefiPlazaPositionsLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(getResourcePoolUnitsLive),
  Layer.provide(entityFungiblesPageServiceLive)
);

const testGatewayLive = Layer.mergeAll(
  stateEntityDetailsLive,
  entityFungiblesPageServiceLive,
  getLedgerStateLive,
  entityNonFungiblesPageServiceLive,
  entityNonFungibleDataServiceLive,
  getNonFungibleBalanceLive,
  getNftResourceManagersLive,
  getNonFungibleIdsLive,
  getEntityDetailsServiceLive,
  getResourcePoolUnitsLive
);

const testStakingLive = Layer.mergeAll(
  getUserStakingPositionsLive,
  getLsulpLive,
  convertLsuToXrdLive,
  getLsulpValueLive,
  getAllValidatorsServiceLive
);

const testDappLive = Layer.mergeAll(
  getWeftFinancePositionsLive,
  getRootFinancePositionLive,
  getShapeLiquidityAssetsLive,
  getShapeLiquidityClaimsLive,
  getQuantaSwapBinMapLive,
  getDefiPlazaPositionsLive
);

const getAccountBalancesAtStateVersionLive =
  GetAccountBalancesAtStateVersionLive.pipe(
    Layer.provide(testGatewayLive),
    Layer.provide(testStakingLive),
    Layer.provide(testDappLive)
  );

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "api" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const selectedOptionMap = new Map<string, string>();

for (const account of accounts) {
  selectedOptionMap.set(account.account_address, account.selected_option);
}

describe("getAccountBalancesAtStateVersion", () => {
  it("should get account balances at state version", async () => {
    const addresses = accounts.map((account) => account.account_address);

    const program = Effect.provide(
      Effect.gen(function* () {
        const getAccountBalancesAtStateVersionService =
          yield* GetAccountBalancesAtStateVersionService;
        const getAllValidatorsService = yield* GetAllValidatorsService;

        const validators = yield* getAllValidatorsService();

        return yield* getAccountBalancesAtStateVersionService({
          addresses: addresses,
          at_ledger_state: {
            timestamp: new Date("2025-06-05T08:00:00.000Z"),
          },
          validators: validators,
        }).pipe(Effect.withSpan("getAccountBalancesAtStateVersionService"));
      }),
      (() => {
        const coreLayer = Layer.mergeAll(
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
          getEntityDetailsLive
        );

        const additionalLayer = Layer.mergeAll(
          entityNonFungibleDataLive,
          entityNonFungiblesPageServiceLive,
          getComponentStateLive,
          getQuantaSwapBinMapLive,
          getShapeLiquidityClaimsLive,
          getDefiPlazaPositionsLive,
          getResourcePoolUnitsLive,
          getNftResourceManagersLive,
          getNonFungibleIdsLive
        );

        return Layer.mergeAll(coreLayer, additionalLayer);
      })()
    );

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(NodeSdkLive),
        catchAll((error) => {
          console.error(JSON.stringify(error, null, 2));
          return Effect.fail(error);
        })
      )
    );

    console.log(JSON.stringify(result, null, 2));
  }, 600_000);
});

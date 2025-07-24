import { NodeSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Effect, Exit, Layer } from "effect";
import { describe, expect, it } from "vitest";

// Test target
import { GetAccountBalancesAtStateVersionService } from "./getAccountBalancesAtStateVersion";

import { EntityFungiblesPageService } from "../../common/gateway/entityFungiblesPage";
import { EntityNonFungibleDataService } from "../../common/gateway/entityNonFungiblesData";
import { EntityNonFungiblesPageService } from "../../common/gateway/entityNonFungiblesPage";
// Gateway services
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import { GetAllValidatorsService } from "../../common/gateway/getAllValidators";
import { GetComponentStateService } from "../../common/gateway/getComponentState";
import { GetEntityDetailsService } from "../../common/gateway/getEntityDetails";
import { GetFungibleBalanceService } from "../../common/gateway/getFungibleBalance";
import { GetKeyValueStoreService } from "../../common/gateway/getKeyValueStore";
import { GetLedgerStateService } from "../../common/gateway/getLedgerState";
import { GetNftResourceManagersService } from "../../common/gateway/getNftResourceManagers";
import { GetNonFungibleBalanceService } from "../../common/gateway/getNonFungibleBalance";
import { GetNonFungibleIdsService } from "../../common/gateway/getNonFungibleIds";
import { KeyValueStoreDataService } from "../../common/gateway/keyValueStoreData";
import { KeyValueStoreKeysService } from "../../common/gateway/keyValueStoreKeys";

import { ConvertLsuToXrdLive } from "../../common/staking/convertLsuToXrd";
// Staking services
import { GetUserStakingPositionsLive } from "../../common/staking/getUserStakingPositions";

// DApp services
import { GetLsulpLive } from "../../common/dapps/caviarnine/getLsulp";
import { GetLsulpValueLive } from "../../common/dapps/caviarnine/getLsulpValue";
import { GetQuantaSwapBinMapLive } from "../../common/dapps/caviarnine/getQuantaSwapBinMap";
import { GetShapeLiquidityAssetsLive } from "../../common/dapps/caviarnine/getShapeLiquidityAssets";
import { GetShapeLiquidityClaimsLive } from "../../common/dapps/caviarnine/getShapeLiquidityClaims";
import { GetDefiPlazaPositionsLive } from "../../common/dapps/defiplaza/getDefiPlazaPositions";
import { GetRootFinancePositionsService } from "../../common/dapps/rootFinance/getRootFinancePositions";
import { GetWeftFinancePositionsService } from "../../common/dapps/weftFinance/getWeftFinancePositions";

// Resource pool services
import { GetResourcePoolUnitsLive } from "../../common/resource-pool/getResourcePoolUnits";

// Config and fixtures
import { createAppConfigLive } from "../config/appConfig";
import { UnstakingReceiptProcessorService } from "../../common/staking/unstakingReceiptProcessor";
import { GetHyperstakePositionsService } from "../../common/dapps/caviarnine/getHyperstakePositions";
import { GetOciswapLiquidityAssetsService } from "../../common/dapps/ociswap/getOciswapLiquidityAssets";
import { GetOciswapLiquidityClaimsService } from "../../common/dapps/ociswap/getOciswapLiquidityClaims";
import { GetSurgeLiquidityPositionsService } from "../../common/dapps/surge/getSurgeLiquidityPositions";
import { GetOciswapResourcePoolPositionsService } from "../../common/dapps/ociswap/getOciswapResourcePoolPositions";
import { GetCaviarnineResourcePoolPositionsService } from "../../common/dapps/caviarnine/getCaviarnineResourcePoolPositions";

const appConfigServiceLive = createAppConfigLive();

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getLedgerStateLive = GetLedgerStateService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getAllValidatorsServiceLive = GetAllValidatorsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getFungibleBalanceServiceLive = GetFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
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
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive)
);

const getNftResourceManagersLive = GetNftResourceManagersService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleIdsLive)
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceService.Default.pipe(
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
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(getAllValidatorsServiceLive)
);

const getLsulpLive = GetLsulpLive.pipe(
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
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getComponentStateServiceLive = GetComponentStateService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(appConfigServiceLive)
);

const keyValueStoreDataServiceLive = KeyValueStoreDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const keyValueStoreKeysServiceLive = KeyValueStoreKeysService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreServiceLive = GetKeyValueStoreService.Default.pipe(
  Layer.provide(gatewayApiClientLive),

  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
);

const getFungibleBalanceLive = GetFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),

  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getWeftFinancePositionsLive = GetWeftFinancePositionsService.Default.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(getComponentStateServiceLive),
  Layer.provide(getKeyValueStoreServiceLive)
);

const getRootFinancePositionLive = GetRootFinancePositionsService.Default.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getKeyValueStoreServiceLive),
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
);

const keyValueStoreDataLive = KeyValueStoreDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreKeysLive = KeyValueStoreKeysService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreLive = GetKeyValueStoreService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(keyValueStoreDataLive),
  Layer.provide(getKeyValueStoreKeysLive)
);

const getEntityDetailsLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungibleDataLive = EntityNonFungibleDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getComponentStateLive = GetComponentStateService.Default.pipe(
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

const unstakingReceiptProcessorLive =
  UnstakingReceiptProcessorService.Default.pipe(
    Layer.provide(getFungibleBalanceServiceLive),
    Layer.provide(entityNonFungibleDataLive)
  );

const getHyperstakePositionsLive = GetHyperstakePositionsService.Default.pipe(
  Layer.provide(getFungibleBalanceServiceLive),
  Layer.provide(entityNonFungibleDataLive),
  Layer.provide(getResourcePoolUnitsLive)
);

const getOciswapLiquidityClaimsLive =
  GetOciswapLiquidityClaimsService.Default.pipe(
    Layer.provide(entityNonFungibleDataLive)
  );

const getOciswapLiquidityAssetsService =
  GetOciswapLiquidityAssetsService.Default.pipe(
    Layer.provide(getOciswapLiquidityClaimsLive),
    Layer.provide(getComponentStateLive),
    Layer.provide(getNonFungibleBalanceLive)
  );

const getSurgeLiquidityPositionsLive =
  GetSurgeLiquidityPositionsService.Default.pipe(
    Layer.provide(getFungibleBalanceServiceLive),
    Layer.provide(entityNonFungibleDataLive),
    Layer.provide(getResourcePoolUnitsLive),
    Layer.provide(getComponentStateLive)
  );

const getOciswapResourcePoolPositionsLive =
  GetOciswapResourcePoolPositionsService.Default.pipe(
    Layer.provide(getResourcePoolUnitsLive),
    Layer.provide(getFungibleBalanceLive)
  );

const getCaviarnineResourcePoolPositionsLive =
  GetCaviarnineResourcePoolPositionsService.Default.pipe(
    Layer.provide(getResourcePoolUnitsLive),
    Layer.provide(getFungibleBalanceLive)
  );

const getAccountBalancesAtStateVersionLive =
  GetAccountBalancesAtStateVersionService.Default.pipe(
    Layer.provide(testGatewayLive),
    Layer.provide(testStakingLive),
    Layer.provide(testDappLive),
    Layer.provide(getFungibleBalanceServiceLive),
    Layer.provide(unstakingReceiptProcessorLive),
    Layer.provide(getHyperstakePositionsLive),
    Layer.provide(getOciswapLiquidityAssetsService),
    Layer.provide(getSurgeLiquidityPositionsLive),
    Layer.provide(getOciswapResourcePoolPositionsLive),
    Layer.provide(getCaviarnineResourcePoolPositionsLive)
  );

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "api" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

describe("getAccountBalancesAtStateVersion", () => {
  it("should get account balances at state version", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getAccountBalancesAtStateVersionService =
          yield* GetAccountBalancesAtStateVersionService;

        const getAllValidatorsService = yield* GetAllValidatorsService;

        const validators = yield* getAllValidatorsService();

        return yield* getAccountBalancesAtStateVersionService({
          addresses: [
            "account_rdx12xwrtgmq68wqng0d69qx2j627ld2dnfufdklkex5fuuhc8eaeltq2k",
          ],
          at_ledger_state: {
            timestamp: new Date("2025-06-05T08:00:00.000Z"),
          },
          validators: validators,
        }).pipe(Effect.withSpan("getAccountBalancesAtStateVersionService"));
      }),
      Layer.mergeAll(
        getAccountBalancesAtStateVersionLive,
        getAllValidatorsServiceLive
      )
    );

    const result = await Effect.runPromiseExit(
      program.pipe(Effect.provide(NodeSdkLive))
    );

    Exit.match(result, {
      onSuccess: (value) => {
        expect(value.items.length).toBeGreaterThan(0);
      },
      onFailure: (error) => {
        console.error(JSON.stringify(error, null, 2));
        throw new Error("Test failed");
      },
    });
  }, 600_000);
});

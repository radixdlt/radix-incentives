import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../common/gateway/getEntityDetails";
import { createAppConfigLive } from "../../common/config/appConfig";
import { LoggerLive } from "../../common/logger/logger";
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
  GetVotingPowerAtStateVersionLive,
  GetVotingPowerAtStateVersionService,
} from "./getVotingPowerAtStateVersion";

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

const appConfigServiceLive = createAppConfigLive();

const loggerLive = LoggerLive.pipe(Layer.provide(appConfigServiceLive));

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
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
  Layer.provide(loggerLive),
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

const getNonFungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getUserStakingPositionsLive = GetUserStakingPositionsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive),
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
  Layer.provide(loggerLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const convertLsuToXrdServiceLive = ConvertLsuToXrdLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const convertLsuToXrdLive = ConvertLsuToXrdLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getLsulpValueLive = GetLsulpValueLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive),
  Layer.provide(stateEntityDetailsLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getComponentStateServiceLive = GetComponentStateLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(appConfigServiceLive)
);

const keyValueStoreDataServiceLive = KeyValueStoreDataLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

const keyValueStoreKeysServiceLive = KeyValueStoreKeysLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

const getKeyValueStoreServiceLive = GetKeyValueStoreLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive),
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
);

const getFungibleBalanceLive = GetFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
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

const getVotingPowerAtStateVersionLive = GetVotingPowerAtStateVersionLive.pipe(
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
  Layer.provide(getRootFinancePositionLive)
);

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "api" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const selectedOptionMap = new Map<string, string>();

for (const account of accounts) {
  selectedOptionMap.set(account.account_address, account.selected_option);
}

describe("calculateVotingPower", () => {
  it("should get user voting power", async () => {
    const addresses = accounts.map((account) => account.account_address);
    const program = Effect.provide(
      Effect.gen(function* () {
        const getVotingPowerAtStateVersionService =
          yield* GetVotingPowerAtStateVersionService;

        return yield* getVotingPowerAtStateVersionService({
          addresses: addresses,
          at_ledger_state: {
            timestamp: new Date("2025-05-01T00:00:00.000Z"),
          },
        }).pipe(Effect.withSpan("getVotingPowerAtStateVersionService"));
      }),
      Layer.mergeAll(
        getVotingPowerAtStateVersionLive,
        gatewayApiClientLive,
        loggerLive,
        stateEntityDetailsLive,
        entityFungiblesPageServiceLive,
        getLedgerStateLive,
        entityNonFungiblesPageServiceLive,
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
        getRootFinancePositionLive
      )
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

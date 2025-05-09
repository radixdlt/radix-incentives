import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../gateway/getEntityDetails";
import { createAppConfigLive } from "../config/appConfig";
import { LoggerLive } from "../logger/logger";
import { GetStateVersionLive } from "../gateway/getStateVersion";
import { GetFungibleBalanceLive } from "../gateway/getFungibleBalance";
import { EntityFungiblesPageLive } from "../gateway/entityFungiblesPage";
import { getUserStakingPositions } from "./getUserStakingPositions";
import { EntityNonFungiblesPageLive } from "../gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataLive } from "../gateway/entityNonFungiblesData";
import { GetNonFungibleBalanceLive } from "../gateway/getNonFungibleBalance";
import { GetAllValidatorsLive } from "../gateway/getAllValidators";
import { accounts } from "../../fixtures/accounts";
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const appConfigServiceLive = createAppConfigLive();

const loggerLive = LoggerLive.pipe(Layer.provide(appConfigServiceLive));

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

const getStateVersionLive = GetStateVersionLive.pipe(
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
  Layer.provide(getStateVersionLive)
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
  Layer.provide(getStateVersionLive)
);

const getAllValidatorsServiceLive = GetAllValidatorsLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "api" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

describe("getUserStakingPositions", () => {
  it("should get user staking positions", async () => {
    const program = Effect.provide(
      getUserStakingPositions({
        addresses: accounts,
        state: {
          state_version: 283478629,
        },
      }),
      Layer.mergeAll(
        gatewayApiClientLive,
        loggerLive,
        stateEntityDetailsLive,
        entityFungiblesPageServiceLive,
        getStateVersionLive,
        entityNonFungiblesPageServiceLive,
        entityNonFungibleDataServiceLive,
        getNonFungibleBalanceLive,
        getAllValidatorsServiceLive
      )
    );

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(NodeSdkLive))
    );

    console.log(JSON.stringify(result, null, 2));
  }, 60_000);
});

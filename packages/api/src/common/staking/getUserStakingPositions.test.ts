import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../gateway/getEntityDetails";
import { createAppConfigLive } from "../config/appConfig";
import { LoggerLive } from "../logger/logger";
import { GetLedgerStateLive } from "../gateway/getLedgerState";
import { GetFungibleBalanceLive } from "../gateway/getFungibleBalance";
import { EntityFungiblesPageLive } from "../gateway/entityFungiblesPage";
import {
  GetUserStakingPositionsLive,
  GetUserStakingPositionsService,
} from "./getUserStakingPositions";
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

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "api" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

describe("getUserStakingPositions", () => {
  it("should get user staking positions", async () => {
    const result = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const getUserStakingPositionsService =
            yield* GetUserStakingPositionsService;

          return yield* getUserStakingPositionsService({
            addresses: accounts.map((account) =>
              account.account_address.slice(0, 10)
            ),
            at_ledger_state: {
              state_version: 283478629,
            },
          });
        }),
        Layer.mergeAll(
          gatewayApiClientLive,
          loggerLive,
          stateEntityDetailsLive,
          entityFungiblesPageServiceLive,
          getLedgerStateLive,
          entityNonFungiblesPageServiceLive,
          entityNonFungibleDataServiceLive,
          getNonFungibleBalanceLive,
          getAllValidatorsServiceLive,
          getUserStakingPositionsLive
        )
      )
    );

    console.log(JSON.stringify(result, null, 2));
  }, 60_000);
});

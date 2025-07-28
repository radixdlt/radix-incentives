import { Effect, Exit, Layer, Logger } from "effect";
import { db } from "db/incentives";
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "nonFungibleBalance" },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: "http://127.0.0.1:4318/v1/traces",
    })
  ),
}));

// Gateway services
import { GatewayApiClientLive } from "../../../packages/api/src/common/gateway/gatewayApiClient";
import { EntityNonFungiblesPageService } from "../../../packages/api/src/common/gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataService } from "../../../packages/api/src/common/gateway/entityNonFungiblesData";
import { GetNonFungibleBalanceService } from "../../../packages/api/src/common/gateway/getNonFungibleBalance";
import { GetNftResourceManagersService } from "../../../packages/api/src/common/gateway/getNftResourceManagers";
import { GetNonFungibleIdsService } from "../../../packages/api/src/common/gateway/getNonFungibleIds";
import {
  CaviarNineConstants,
  OciswapConstants,
  RootFinanceConstants,
  WeftFinanceConstants,
} from "../../../packages/data/src";
import { GetAllValidatorsService } from "../../../packages/api/src/common/gateway/getAllValidators";
import { GetLedgerStateService } from "../../../packages/api/src/common/gateway/getLedgerState";

const runnable = Effect.gen(function* () {
  const gatewayApiClientLive = GatewayApiClientLive;

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

  const getAllValidatorsServiceLive = GetAllValidatorsService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getLedgerStateServiceLive = GetLedgerStateService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const getLedgerStateService = yield* Effect.provide(
    GetLedgerStateService,
    getLedgerStateServiceLive
  );

  const at_ledger_state = yield* getLedgerStateService({
    at_ledger_state: { timestamp: new Date("2025-07-20T00:00:00.000Z") },
  });

  const getAllValidators = yield* Effect.provide(
    GetAllValidatorsService,
    getAllValidatorsServiceLive
  );

  const validators = yield* getAllValidators();

  const service = yield* Effect.provide(
    GetNonFungibleBalanceService,
    getNonFungibleBalanceLive
  );

  const addresses = yield* Effect.tryPromise(() =>
    db.query.accounts
      .findMany({
        // limit: 1,
      })
      .then((res) => res.map((r) => r.address))
  );

  const resourceAddresses = [
    ...Object.values(CaviarNineConstants.shapeLiquidityPools).map(
      (pool) => pool.liquidity_receipt
    ),
    ...Object.values(OciswapConstants.pools).map(
      (pool) => pool.lpResourceAddress
    ),
    ...Object.values(OciswapConstants.poolsV2).map(
      (pool) => pool.lpResourceAddress
    ),
    RootFinanceConstants.receiptResourceAddress,
    WeftFinanceConstants.v2.WeftyV2.resourceAddress,
    ...validators.map((validator) => validator.claimNftResourceAddress),
  ];

  yield* Effect.log(
    `getting non fungible balance for ${addresses.length} addresses and ${resourceAddresses.length} resource addresses at state version: ${at_ledger_state.state_version}`
  );

  yield* service({
    addresses,
    at_ledger_state: {
      state_version: at_ledger_state.state_version,
    },
    resourceAddresses,
  }).pipe(Effect.provide(NodeSdkLive));

  yield* Effect.log("done");
});

const result = await Effect.runPromiseExit(
  runnable.pipe(Effect.provide(Logger.pretty))
);

Exit.match(result, {
  onFailure: (error) => {
    console.error(JSON.stringify(error, null, 2));
  },
  onSuccess: (value) => {
    console.log(value);
  },
});

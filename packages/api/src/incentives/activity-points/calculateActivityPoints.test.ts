import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import { createAppConfigLive } from "../config/appConfig";
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { createDbClientLive, DbClientService, DbError } from "../db/dbClient";
import { accounts, db } from "db/incentives";
import {
  CalculateActivityPointsLive,
  CalculateActivityPointsService,
} from "./calculateActivityPoints";
import { UpsertAccountActivityPointsLive } from "./upsertAccountActivityPoints";
import { GetWeekAccountBalancesLive } from "./getWeekAccountBalances";
import { GetWeekByIdLive } from "../week/getWeekById";

const appConfigServiceLive = createAppConfigLive();

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

const dbClientLive = createDbClientLive(db);

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "api" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const upsertAccountActivityPointsLive = UpsertAccountActivityPointsLive.pipe(
  Layer.provide(dbClientLive)
);

const getWeekAccountBalancesLive = GetWeekAccountBalancesLive.pipe(
  Layer.provide(dbClientLive)
);

const getWeekByIdLive = GetWeekByIdLive.pipe(Layer.provide(dbClientLive));

const calculateActivityPointsLive = CalculateActivityPointsLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(upsertAccountActivityPointsLive),
  Layer.provide(getWeekAccountBalancesLive),
  Layer.provide(getWeekByIdLive)
);

describe("calculateActivityPoints", () => {
  it("should calculate activity points", async () => {
    const program = Effect.gen(function* () {
      const db = yield* DbClientService;
      const calculateActivityPointsService =
        yield* CalculateActivityPointsService;

      const accountsResult = yield* Effect.tryPromise({
        try: () => db.select().from(accounts),
        catch: (error) => new DbError(error),
      });

      const result = yield* calculateActivityPointsService({
        weekId: "f3a55278-9ac9-4593-a19f-12a3d884dba2",
        addresses: accountsResult.map((a) => a.address),
      });

      return result;
    }).pipe(
      Effect.catchAll((err) => {
        console.log(JSON.stringify(err, null, 2));
        return Effect.fail(err);
      })
    );

    const result = await Effect.runPromise(
      Effect.provide(
        program,
        Layer.mergeAll(
          dbClientLive,
          calculateActivityPointsLive,
          upsertAccountActivityPointsLive,
          getWeekAccountBalancesLive,
          getWeekByIdLive
        )
      )
    );

    console.log(JSON.stringify(result, null, 2));
  });
});

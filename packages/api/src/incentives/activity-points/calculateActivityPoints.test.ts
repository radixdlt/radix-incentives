import { Effect, Layer, Logger } from "effect";
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { createDbClientLive, DbClientService, DbError } from "../db/dbClient";
import { accounts, db, weeks } from "db/incentives";
import {
  CalculateActivityPointsLive,
  CalculateActivityPointsService,
} from "./calculateActivityPoints";
import { UpsertAccountActivityPointsLive } from "./upsertAccountActivityPoints";

import { GetWeekByIdLive } from "../week/getWeekById";
import { GetTransactionFeesPaginatedLive } from "../transaction-fee/getTransactionFees";
import { GetComponentCallsPaginatedLive } from "../component/getComponentCalls";
import { GetTradingVolumeLive } from "../trading-volume/getTradingVolume";
import { GetAccountAddressByUserIdLive } from "../account/getAccountAddressByUserId";
import { AccountBalanceService } from "../account-balance/accountBalance";

const dbClientLive = createDbClientLive(db);

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "api" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const upsertAccountActivityPointsLive = UpsertAccountActivityPointsLive.pipe(
  Layer.provide(dbClientLive)
);

const accountBalanceServiceLive = AccountBalanceService.Default.pipe(
  Layer.provide(dbClientLive)
);

const getTransactionFeesLive = GetTransactionFeesPaginatedLive.pipe(
  Layer.provide(dbClientLive)
);

const getWeekByIdLive = GetWeekByIdLive.pipe(Layer.provide(dbClientLive));

const getComponentCallsLive = GetComponentCallsPaginatedLive.pipe(
  Layer.provide(dbClientLive)
);

const getTradingVolumeLive = GetTradingVolumeLive.pipe(
  Layer.provide(dbClientLive)
);

const getAccountAddressByUserIdLive = GetAccountAddressByUserIdLive.pipe(
  Layer.provide(dbClientLive)
);

const calculateActivityPointsLive = CalculateActivityPointsLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(upsertAccountActivityPointsLive),
  Layer.provide(accountBalanceServiceLive),
  Layer.provide(getWeekByIdLive),
  Layer.provide(getTransactionFeesLive),
  Layer.provide(getComponentCallsLive),
  Layer.provide(getTradingVolumeLive),
  Layer.provide(getAccountAddressByUserIdLive)
);

describe("calculateActivityPoints", () => {
  it("should calculate activity points", async () => {
    const week = await db.select().from(weeks).limit(1);

    const program = Effect.gen(function* () {
      const db = yield* DbClientService;
      const calculateActivityPointsService =
        yield* CalculateActivityPointsService;

      let offset = 0;

      while (true) {
        const accountsResult = yield* Effect.tryPromise({
          try: () => db.select().from(accounts).limit(10000).offset(offset),
          catch: (error) => new DbError(error),
        });

        offset += 10000;

        if (accountsResult.length === 0) {
          break;
        }

        yield* calculateActivityPointsService({
          weekId: week[0].id,
          addresses: accountsResult.map((a) => a.address),
        });
      }
    }).pipe(
      Effect.catchAll((err) => {
        console.log(JSON.stringify(err, null, 2));
        return Effect.fail(err);
      })
    );

    const result = await Effect.runPromise(
      Effect.provide(
        program,
        Layer.merge(calculateActivityPointsLive, dbClientLive)
      ).pipe(Effect.provide(Logger.pretty))
    );

    console.log(JSON.stringify(result, null, 2));
  }, 30_000);
});

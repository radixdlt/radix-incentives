import { seasons, weeks, db } from "db/incentives";
import path from "node:path";
import { eq } from "drizzle-orm";
import { Effect, Layer, Logger } from "effect";
import { createDbClientLive } from "api/incentives";
import {
  CalculateActivityPointsLive,
  CalculateActivityPointsService,
} from "../../../packages/api/src/incentives/activity-points/calculateActivityPoints";
import { GetWeekByIdLive } from "../../../packages/api/src/incentives/week/getWeekById";
import { CalculateTWASQLLive } from "../../../packages/api/src/incentives/activity-points/calculateTWASQL";
import { UpsertAccountActivityPointsLive } from "../../../packages/api/src/incentives/activity-points/upsertAccountActivityPoints";
import { GetTransactionFeesPaginatedLive } from "../../../packages/api/src/incentives/transaction-fee/getTransactionFees";
import { GetComponentCallsPaginatedLive } from "../../../packages/api/src/incentives/component/getComponentCalls";
import { GetTradingVolumeLive } from "../../../packages/api/src/incentives/trading-volume/getTradingVolume";
import { GetAccountAddressByUserIdLive } from "../../../packages/api/src/incentives/account/getAccountAddressByUserId";
import { createDbReadOnlyClientLive } from "../../../packages/api/src/incentives/db/dbClient";

const WEEK_ID = "30da196b-7602-4b06-a558-bbb5b5441186";

const runnable = Effect.gen(function* () {
  const outputDir = path.join(import.meta.dirname, "../output");

  yield* Effect.log("Running season points calculation");

  const dbLayer = createDbClientLive(db);

  const getWeekByIdService = GetWeekByIdLive.pipe(Layer.provide(dbLayer));
  const calculateTWASQLService = CalculateTWASQLLive.pipe(
    Layer.provide(dbLayer)
  );
  const upsertAccountActivityPointsLive = UpsertAccountActivityPointsLive.pipe(
    Layer.provide(dbLayer)
  );
  const getTransactionFeesLive = GetTransactionFeesPaginatedLive.pipe(
    Layer.provide(dbLayer)
  );
  const getComponentCallsLive = GetComponentCallsPaginatedLive.pipe(
    Layer.provide(dbLayer)
  );
  const getTradingVolumeLive = GetTradingVolumeLive.pipe(
    Layer.provide(dbLayer)
  );
  const getAccountAddressByUserIdService = GetAccountAddressByUserIdLive.pipe(
    Layer.provide(dbLayer)
  );
  const dbReadOnlyClientService = createDbReadOnlyClientLive(db);

  const calculateActivityPointsServiceLive = CalculateActivityPointsLive.pipe(
    Layer.provide(getWeekByIdService),
    Layer.provide(calculateTWASQLService),
    Layer.provide(upsertAccountActivityPointsLive),
    Layer.provide(getTransactionFeesLive),
    Layer.provide(getComponentCallsLive),
    Layer.provide(getTradingVolumeLive),
    Layer.provide(getAccountAddressByUserIdService),
    Layer.provide(dbReadOnlyClientService)
  );

  const service = yield* Effect.provide(
    CalculateActivityPointsService,
    calculateActivityPointsServiceLive
  );

  const seasonId = yield* Effect.tryPromise(() =>
    db.query.seasons
      .findFirst({
        where: eq(seasons.status, "active"),
      })
      .then((result) => result?.id)
  );

  const week = yield* Effect.tryPromise(() =>
    db.query.weeks.findFirst({
      where: eq(weeks.id, WEEK_ID),
    })
  );

  if (!week) {
    return yield* Effect.fail("Week not found");
  }

  const activityCategoryWeeks = yield* Effect.tryPromise(() =>
    db.query.activityCategoryWeeks.findMany()
  );

  if (!seasonId) {
    return yield* Effect.fail("Season not found");
  }

  if (activityCategoryWeeks.length === 0) {
    return yield* Effect.fail("Activity category weeks not found");
  }

  yield* service({
    weekId: week.id,
    addresses: [],
    useWeekEndDate: true,
  });

  yield* Effect.log("Season points calculation complete");

  yield* Effect.log("Writing results to file");

  // // Ensure output directory exists
  // if (!fs.existsSync(outputDir)) {
  //   fs.mkdirSync(outputDir, { recursive: true });
  // }

  // fs.writeFileSync(
  //   path.join(outputDir, "results.json"),
  //   JSON.stringify(withActivityPoints, null, 2)
  // );

  // yield* Effect.log("Results written to file");
});

await Effect.runPromise(runnable.pipe(Effect.provide(Logger.pretty)));

import {
  activities,
  seasons,
  userSeasonPoints,
  weeks,
  accounts,
  accountActivityPoints,
  db,
} from "db/incentives";
import path from "node:path";
import { eq } from "drizzle-orm";
import { Effect, Layer, Logger } from "effect";
import {
  ActivityCategoryWeekService,
  AddSeasonPointsToUserService,
  CalculateSeasonPointsService,
  createDbClientLive,
  GetSeasonPointMultiplierService,
  SeasonService,
  UpdateWeekStatusService,
  UserActivityPointsService,
  WeekService,
} from "api/incentives";
import fs from "node:fs";
import { groupBy } from "effect/Array";
import { GetUsersPaginatedLive } from "../../../packages/api/src/incentives/user/getUsersPaginated";
import { ActivityWeekService } from "../../../packages/api/src/incentives/activity-week/activityWeek";

const WEEK_ID = "30da196b-7602-4b06-a558-bbb5b5441186";

const runnable = Effect.gen(function* () {
  const outputDir = path.join(import.meta.dirname, "../output");

  yield* Effect.log("Running season points calculation");

  const dbLayer = createDbClientLive(db);

  const seasonServiceLive = SeasonService.Default.pipe(Layer.provide(dbLayer));
  const weekServiceLive = WeekService.Default.pipe(Layer.provide(dbLayer));
  const activityCategoryWeekServiceLive =
    ActivityCategoryWeekService.Default.pipe(Layer.provide(dbLayer));
  const userActivityPointsServiceLive = UserActivityPointsService.Default.pipe(
    Layer.provide(dbLayer)
  );
  const getSeasonPointMultiplierServiceLive =
    GetSeasonPointMultiplierService.Default.pipe(Layer.provide(dbLayer));

  const addSeasonPointsToUserServiceLive =
    AddSeasonPointsToUserService.Default.pipe(Layer.provide(dbLayer));

  const updateWeekStatusServiceLive = UpdateWeekStatusService.Default.pipe(
    Layer.provide(dbLayer)
  );

  const getUsersPaginatedServiceLive = GetUsersPaginatedLive.pipe(
    Layer.provide(dbLayer)
  );

  const activityWeekServiceLive = ActivityWeekService.Default.pipe(
    Layer.provide(dbLayer)
  );

  const calculateSeasonPointsServiceLive =
    CalculateSeasonPointsService.Default.pipe(
      Layer.provide(seasonServiceLive),
      Layer.provide(weekServiceLive),
      Layer.provide(activityCategoryWeekServiceLive),
      Layer.provide(userActivityPointsServiceLive),
      Layer.provide(getSeasonPointMultiplierServiceLive),
      Layer.provide(addSeasonPointsToUserServiceLive),
      Layer.provide(updateWeekStatusServiceLive),
      Layer.provide(getUsersPaginatedServiceLive),
      Layer.provide(activityWeekServiceLive)
    );

  const service = yield* Effect.provide(
    CalculateSeasonPointsService,
    calculateSeasonPointsServiceLive
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

  yield* service.run({
    weekId: week.id,
    force: true,
    markAsProcessed: false,
  });

  yield* Effect.log("Season points calculation complete");

  yield* Effect.log("Writing results to file");

  const userSeasonPointsResults = yield* Effect.tryPromise(() =>
    db
      .select()
      .from(userSeasonPoints)
      .where(eq(userSeasonPoints.weekId, week.id))
  );

  const accountActivityPointsResults = yield* Effect.tryPromise(() =>
    db
      .select({
        userId: accounts.userId,
        weekId: accountActivityPoints.weekId,
        activityId: accountActivityPoints.activityId,
        activityPoints: accountActivityPoints.activityPoints,
        accountAddress: accounts.address,
        activityCategory: activities.category,
      })
      .from(accountActivityPoints)
      .where(eq(accountActivityPoints.weekId, week.id))
      .innerJoin(
        accounts,
        eq(accountActivityPoints.accountAddress, accounts.address)
      )
      .innerJoin(
        activities,
        eq(accountActivityPoints.activityId, activities.id)
      )
  );

  const groupedByUserId = groupBy(
    accountActivityPointsResults,
    (item) => item.userId
  );

  const withActivityPoints = userSeasonPointsResults.map(
    ({ userId, points }) => ({
      userId,
      seasonPoints: points,
      activityPoints: groupedByUserId[userId]?.map(
        ({ activityPoints, accountAddress, activityId }) => {
          const groupByActivityCategory = Object.entries(
            groupBy(groupedByUserId[userId], (item) => item.activityCategory)
          ).map(([activityCategory, items]) => ({
            activityCategory,
            activities: items.map((item) => ({
              activityId: item.activityId,
              activityPoints: item.activityPoints,
              accountAddress: item.accountAddress,
            })),
          }));

          return {
            accountAddress,
            categories: groupByActivityCategory,
          };
        }
      ),
    })
  );

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "results.json"),
    JSON.stringify(withActivityPoints, null, 2)
  );

  yield* Effect.log("Results written to file");
});

await Effect.runPromise(runnable.pipe(Effect.provide(Logger.pretty)));

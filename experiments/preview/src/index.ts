import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import {
  activities,
  activityCategories,
  activityCategoryWeeks,
  activityWeeks,
  schema,
  seasons,
  users,
  userSeasonPoints,
  weeks,
  accounts,
  accountActivityPoints,
} from "db/incentives";
import postgres from "postgres";
import path from "node:path";
import { eq, count, sum } from "drizzle-orm";
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

export const runPreview = async (
  dumpPath: string,
  outputDir: string
): Promise<void> => {
  const postgresContainer = await new PostgreSqlContainer(
    "postgres:17"
  ).start();

  const dbUrl = postgresContainer.getConnectionUri();
  const client = postgres(dbUrl);
  const db = drizzle(client, { schema });

  const migrationFolderPath = path.join(
    import.meta.dirname,
    "../../../packages/db/src/incentives/drizzle"
  );

  const loadDump = async () => {
    console.log("Loading database dump...");

    // Copy dump file to container
    await postgresContainer.copyFilesToContainer([
      { source: dumpPath, target: "/tmp/dump.sql" },
    ]);

    // Execute the dump using psql
    const result = await postgresContainer.exec([
      "psql",
      "-U",
      postgresContainer.getUsername(),
      "-d",
      postgresContainer.getDatabase(),
      "-f",
      "/tmp/dump.sql",
    ]);

    if (result.exitCode === 0) {
      console.log("Database dump loaded successfully");
    } else {
      console.error("Error loading dump:", result.stderr);
      throw new Error("Failed to load database dump");
    }
  };

  const seedData = async () => {
    const activitiesResults = await db.select().from(activities);

    const weeksResults = await db
      .select()
      .from(weeks)
      .where(eq(weeks.status, "active"));

    await db
      .insert(activityCategoryWeeks)
      .values(
        activitiesResults
          .map((item) => ({
            activityId: item.id,
            weekId: weeksResults[0].id,
            pointsPool: 100_000,
            activityCategoryId: item.category,
          }))
          .filter(
            (item) =>
              item.activityId !== "common" && !item.activityId.includes("hold_")
          )
      )
      .returning()
      .onConflictDoNothing();
  };

  const runnable = Effect.gen(function* () {
    yield* Effect.log("Starting database preparation");

    yield* Effect.log("Loading database dump");
    yield* Effect.tryPromise(() => loadDump());

    yield* Effect.log("Migrating database");
    yield* Effect.tryPromise(() =>
      migrate(db, { migrationsFolder: migrationFolderPath })
    );

    yield* Effect.log("Seeding data");
    yield* Effect.tryPromise(() => seedData());

    yield* Effect.log("Data preparation complete");

    yield* Effect.log("Running season points calculation");

    const dbLayer = createDbClientLive(db);

    const seasonServiceLive = SeasonService.Default.pipe(
      Layer.provide(dbLayer)
    );
    const weekServiceLive = WeekService.Default.pipe(Layer.provide(dbLayer));
    const activityCategoryWeekServiceLive =
      ActivityCategoryWeekService.Default.pipe(Layer.provide(dbLayer));
    const userActivityPointsServiceLive =
      UserActivityPointsService.Default.pipe(Layer.provide(dbLayer));
    const getSeasonPointMultiplierServiceLive =
      GetSeasonPointMultiplierService.Default.pipe(Layer.provide(dbLayer));

    const addSeasonPointsToUserServiceLive =
      AddSeasonPointsToUserService.Default.pipe(Layer.provide(dbLayer));

    const updateWeekStatusServiceLive = UpdateWeekStatusService.Default.pipe(
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
        Layer.provide(updateWeekStatusServiceLive)
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

    const weekId = yield* Effect.tryPromise(() =>
      db.query.weeks
        .findFirst({
          where: eq(weeks.status, "active"),
        })
        .then((result) => result?.id)
    );

    const activityCategoryWeeks = yield* Effect.tryPromise(() =>
      db.query.activityCategoryWeeks.findMany()
    );

    if (!seasonId) {
      return yield* Effect.fail("Season not found");
    }

    if (!weekId) {
      return yield* Effect.fail("Week not found");
    }

    if (activityCategoryWeeks.length === 0) {
      return yield* Effect.fail("Activity category weeks not found");
    }

    yield* service.run({
      seasonId,
      weekId,
      force: true,
      endOfWeek: false,
    });

    yield* Effect.log("Season points calculation complete");

    yield* Effect.log("Writing results to file");

    const userSeasonPointsResults = yield* Effect.tryPromise(() =>
      db
        .select()
        .from(userSeasonPoints)
        .where(eq(userSeasonPoints.weekId, weekId))
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
        .where(eq(accountActivityPoints.weekId, weekId))
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
};

// Run directly if this file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
  const dumpPath = path.join(import.meta.dirname, "../dump.sql");
  const outputDir = path.join(import.meta.dirname, "../output");

  await runPreview(dumpPath, outputDir).catch((error) => {
    console.error("Error running preview:", error);
    process.exit(1);
  });

  console.log("done");
  process.exit(0);
}

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { activityCategoriesData, activitiesData } from "data";

import {
  activities,
  activityCategories,
  activityWeeks,
  schema,
  seasons,
  weeks,
} from "db/incentives";
import postgres from "postgres";
import path from "node:path";
import { sql } from "drizzle-orm";

declare module "vitest" {
  export interface ProvidedContext {
    testDbUrl: string;
    weekId: string;
    seasonId: string;
  }
}

export default async function setup({ provide }) {
  console.log("setup: setting up postgres container");

  const postgresContainer = await new PostgreSqlContainer(
    "postgres:17"
  ).start();

  const dbUrl = postgresContainer.getConnectionUri();
  const client = postgres(dbUrl);
  const db = drizzle(client, { schema });
  const migrationFolderPath = path.join(
    import.meta.dirname,
    "../../../db/src/incentives/drizzle"
  );

  await migrate(db, { migrationsFolder: migrationFolderPath });

  await db
    .insert(activityCategories)
    .values(activityCategoriesData)
    .returning()
    .onConflictDoUpdate({
      target: [activityCategories.id],
      set: {
        name: sql`excluded.name`,
      },
    });

  const activityResults = await db
    .insert(activities)
    .values(activitiesData)
    .returning()
    .onConflictDoUpdate({
      target: [activities.id],
      set: {
        name: sql`excluded.name`,
        category: sql`excluded.category`,
      },
    });

  const SEASON_ID = "b8b73145-4d93-44eb-b2ba-01b079fd8a5c";

  await db
    .insert(seasons)
    .values([
      {
        name: "Season 1",
        status: "active",
        id: SEASON_ID,
      },
    ])
    .returning()
    .onConflictDoNothing();

  const weekResults = await db
    .insert(weeks)
    .values([
      {
        startDate: new Date("2025-07-07 00:00:00+00"),
        endDate: new Date("2025-07-13 23:59:59+00"),
        seasonId: SEASON_ID,
        id: "30da196b-7602-4b06-a558-bbb5b5441186",
      },
    ])
    .returning()
    .onConflictDoNothing();

  for (const week of weekResults) {
    console.log("Activities seeded");

    await db
      .insert(activityWeeks)
      .values(
        activityResults
          .map((item) => ({
            activityId: item.id,
            weekId: week.id,
            pointsPool: 100_000,
            status: "active" as const,
          }))
          .filter(
            (item) =>
              item.activityId !== "common" && !item.activityId.includes("hold_")
          )
      )
      .returning()
      .onConflictDoNothing();

    console.log(`ActivityWeeks seeded for week ${week.id}`);
  }

  provide("testDbUrl", dbUrl);
  provide("weekId", weekResults.at(-1)?.id);
  provide("seasonId", SEASON_ID);

  return async function teardown() {
    console.log("*** teardown -- stopping postgres container");
    await postgresContainer.stop();
    console.log("*** teardown -- container stopped");
  };
}

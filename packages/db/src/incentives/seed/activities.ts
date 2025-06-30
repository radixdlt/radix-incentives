import {
  activities,
  activityCategories,
  activityWeeks,
  seasons,
  weeks,
} from "../schema";
import { db } from "../client";
import { sql } from "drizzle-orm";
import {
  activityCategoriesToSeed,
  type ActivityCategoryKey,
  type ActivityId,
} from "../types";
import { activitiesData } from "./data/activitiesData";

const WEEK_ID = "6b209cf9-5932-487e-bf75-9d6f7d2330dd";
const SEASON_ID = "036031e3-8bfb-4d2f-b653-f05c76f07704";

const [seasonResult] = await db
  .insert(seasons)
  .values([
    {
      startDate: new Date("2025-06-01:00:00:00Z"),
      endDate: new Date("2025-07-30:23:59:59Z"),
      name: "Season 1",
      status: "active",
      id: SEASON_ID,
    },
  ])
  .returning()
  .onConflictDoNothing();

console.log("Season seeded", seasonResult);

const [weekResult] = await db
  .insert(weeks)
  .values([
    {
      startDate: new Date("2025-06-02:00:00:00Z"),
      endDate: new Date("2025-06-08:23:59:59Z"),
      seasonId: SEASON_ID,
      id: WEEK_ID,
    },
  ])
  .returning()
  .onConflictDoNothing();

console.log("Week seeded", weekResult);

const activityCategoryResults = await db
  .insert(activityCategories)
  .values(activityCategoriesToSeed)
  .returning()
  .onConflictDoUpdate({
    target: [activityCategories.id],
    set: {
      name: sql`excluded.name`,
    },
  });

console.log("Activity categories seeded", activityCategoryResults);

const activitiesToSeed: { id: ActivityId; category: ActivityCategoryKey }[] =
  activitiesData.map((activity) => ({
    id: activity.id as ActivityId,
    category: activity.category,
  }));

const activityResults = await db
  .insert(activities)
  .values(activitiesToSeed)
  .returning()
  .onConflictDoUpdate({
    target: [activities.id],
    set: {
      name: sql`excluded.name`,
      category: sql`excluded.category`,
    },
  });

console.log("Activities seeded", activityResults);

const [activityWeekResult] = await db
  .insert(activityWeeks)
  .values(
    activityResults
      .map((item) => ({
        activityId: item.id,
        weekId: WEEK_ID,
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

console.log("ActivityWeeks seeded", activityWeekResult);

console.log("Users and accounts successfully seeded");

process.exit(0);

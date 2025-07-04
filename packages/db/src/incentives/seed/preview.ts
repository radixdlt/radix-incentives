import { activities, activityCategories, activityWeeks } from "../schema";
import { db } from "../client";
import { sql } from "drizzle-orm";
import {
  activityCategoriesToSeed,
  type ActivityCategoryKey,
  type ActivityId,
} from "../types";
import { activitiesData } from "./data/activitiesData";

console.log(await db.query.weeks.findMany());

const WEEK_1_ID = "7ddac832-0823-471c-aaf6-956600afa58e";
const WEEK_2_ID = "30da196b-7602-4b06-a558-bbb5b5441186";

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

for (const WEEK_ID of [WEEK_1_ID, WEEK_2_ID]) {
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

  console.log(`ActivityWeeks seeded for week ${WEEK_ID}`, activityWeekResult);
}

process.exit(0);

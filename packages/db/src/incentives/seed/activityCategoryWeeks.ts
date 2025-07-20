import { sql } from "drizzle-orm";
import { db } from "../client";
import {
  activities,
  activityCategories,
  activityCategoryWeeks,
  activityWeeks,
  weeks,
} from "../schema";

export const seedActivityCategoryWeeks = async () => {
  const activityCategoriesResults = await db.select().from(activityCategories);

  const activitiesResults = await db.select().from(activities);

  const weeksResults = await db.select().from(weeks);

  for (const week of weeksResults) {
    await db
      .insert(activityCategoryWeeks)
      .values(
        activityCategoriesResults.map((item) => ({
          activityId: item.id,
          weekId: week.id,
          pointsPool: ["common", "maintainXrdBalance"].includes(item.id)
            ? 0
            : 100_000,
          activityCategoryId: item.id,
        }))
      )
      .returning()
      .onConflictDoUpdate({
        target: [
          activityCategoryWeeks.activityCategoryId,
          activityCategoryWeeks.weekId,
        ],
        set: {
          pointsPool: sql`excluded.points_pool`,
        },
      });

    await db
      .insert(activityWeeks)
      .values(
        activitiesResults.map((item) => ({
          activityId: item.id,
          weekId: week.id,
          multiplier: 1,
        }))
      )
      .onConflictDoNothing();
  }

  console.log("Activity category weeks seeded");
};

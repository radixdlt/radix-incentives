import { db } from "../client";
import { activities, activityCategoryWeeks, weeks } from "../schema";

export const seedActivityCategoryWeeks = async () => {
  const activitiesResults = await db.select().from(activities);

  const weeksResults = await db.select().from(weeks);

  for (const week of weeksResults) {
    await db
      .insert(activityCategoryWeeks)
      .values(
        activitiesResults.map((item) => ({
          activityId: item.id,
          weekId: week.id,
          pointsPool: item.id.includes("hold_") ? 0 : 100_000,
          activityCategoryId: item.category,
        }))
      )
      .returning()
      .onConflictDoNothing();
  }

  console.log("Activity category weeks seeded");
};

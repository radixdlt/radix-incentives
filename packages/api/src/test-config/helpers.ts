import { activityCategoriesData, activityData, dappsData } from "data";
import { activities, activityCategories, dapps, type Db } from "db/incentives";
import { sql } from "drizzle-orm";

export const createActivities = async (db: Db) => {
  await db.insert(dapps).values(dappsData).onConflictDoNothing();

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

  await db
    .insert(activities)
    .values(
      activityData.map((activity) => ({
        id: activity.activityId,
        category: activity.categoryId,
        dapp: activity.dAppId,
        componentAddresses: activity.componentAddresses,
      }))
    )
    .returning()
    .onConflictDoUpdate({
      target: [activities.id],
      set: {
        name: sql`excluded.name`,
        category: sql`excluded.category`,
      },
    });
};

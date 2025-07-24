import { activities, activityCategories, dapps } from "../schema";
import { db } from "../client";
import { sql } from "drizzle-orm";
import { activityCategoriesData, dappsData, activitiesData } from "data";

export const seedActivities = async () => {
  await db.insert(dapps).values(dappsData).onConflictDoNothing();

  console.log("Dapps seeded");

  await db
    .insert(activityCategories)
    .values(activityCategoriesData)
    .returning()
    .onConflictDoNothing();

  console.log("Activity categories seeded");

  await db
    .insert(activities)
    .values(
      activitiesData.map((activity) => ({
        id: activity.id,
        category: activity.category,
        dapp: activity.dApp,
        componentAddresses: activity.componentAddresses ?? [],
      }))
    )
    .returning()
    .onConflictDoUpdate({
      target: [activities.id],
      set: {
        category: sql`excluded.category`,
        dapp: sql`excluded.dapp`,
        componentAddresses: sql`excluded.component_addresses`,
      },
    });

  console.log("Activities seeded");
};

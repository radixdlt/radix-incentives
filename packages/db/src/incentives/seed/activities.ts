import { activities, activityCategories, dapps } from '../schema';
import { db } from '../client';
import { sql } from 'drizzle-orm';
import { activityCategoriesData, dappsData, activityData } from 'data';

export const seedActivities = async () => {
  await db.insert(dapps).values(dappsData).onConflictDoNothing();

  console.log('Dapps seeded');

  await db
    .insert(activityCategories)
    .values(activityCategoriesData)
    .returning()
    .onConflictDoNothing();

  console.log('Activity categories seeded');

  await db
    .insert(activities)
    .values(
      activityData.map((activity) => ({
        id: activity.activityId,
        category: activity.categoryId,
        dapp: activity.dAppId,
        componentAddresses: activity.componentAddresses,
      })),
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

  console.log('Activities seeded');
};

import { activities, activityCategories } from "../schema";
import { db } from "../client";
import { sql } from "drizzle-orm";
import { ActivityCategoryKey } from "../types";
import { activitiesData } from "./data/activitiesData";

const activityCategoriesToSeed: {
  id: ActivityCategoryKey;
  name: string;
}[] = [
  {
    id: ActivityCategoryKey.maintainXrdBalance,
    name: "Maintain XRD balance",
  },
  {
    id: ActivityCategoryKey.provideStablesLiquidityToDex,
    name: "Provide stables liquidity to a DEX",
  },
  {
    id: ActivityCategoryKey.provideBlueChipLiquidityToDex,
    name: "Provide blue chip liquidity to a DEX",
  },
  {
    id: ActivityCategoryKey.provideNativeLiquidityToDex,
    name: "Provide native liquidity to a DEX",
  },
  {
    id: ActivityCategoryKey.lendingStables,
    name: "Lend stables",
  },
  {
    id: ActivityCategoryKey.transactionFees,
    name: "Paid transaction fees",
  },
  {
    id: ActivityCategoryKey.common,
    name: "Common activities",
  },
  {
    id: ActivityCategoryKey.componentCalls,
    name: "Component calls",
  },
  {
    id: ActivityCategoryKey.tradingVolume,
    name: "Trading volume",
  },
];

export const seedActivities = async () => {
  await db
    .insert(activityCategories)
    .values(activityCategoriesToSeed)
    .returning()
    .onConflictDoUpdate({
      target: [activityCategories.id],
      set: {
        name: sql`excluded.name`,
      },
    });

  console.log("Activity categories seeded");

  await db
    .insert(activities)
    .values(
      activitiesData.map((activity) => ({
        id: activity.id,
        category: activity.category,
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

  console.log("Activities seeded");
};

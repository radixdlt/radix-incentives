import {
  activities,
  activityCategories,
  activityWeeks,
  seasons,
  weeks,
} from "../schema";
import { db } from "../client";
import { sql } from "drizzle-orm";
import { ActivityCategoryKey, type ActivityId } from "../types";

const WEEK_ID = "6b209cf9-5932-487e-bf75-9d6f7d2330dd";
const SEASON_ID = "036031e3-8bfb-4d2f-b653-f05c76f07704";

const [seasonResult] = await db
  .insert(seasons)
  .values([
    {
      startDate: new Date("2025-05-01:00:00:00Z"),
      endDate: new Date("2025-06-30:23:59:59Z"),
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
      endDate: new Date("2025-06-09:00:00:00Z"),
      seasonId: SEASON_ID,
      id: WEEK_ID,
    },
  ])
  .returning()
  .onConflictDoNothing();

console.log("Week seeded", weekResult);

const activityCategoriesToSeed: { id: ActivityCategoryKey; name: string }[] = [
  {
    id: ActivityCategoryKey.maintainXrdBalance,
    name: "Maintain XRD balance",
  },
  {
    id: ActivityCategoryKey.provideStablesLiquidityToDex,
    name: "Provide stables liquidity to a DEX",
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
];

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

const activitiesToSeed: { id: ActivityId; category: ActivityCategoryKey }[] = [
  // DEX activities
  {
    id: "c9_lp_xrd-xusdc",
    category: ActivityCategoryKey.provideStablesLiquidityToDex,
  },
  {
    id: "defiPlaza_lp_xrd-xusdc",
    category: ActivityCategoryKey.provideStablesLiquidityToDex,
  },

  // Lending activities
  {
    id: "root_lend_xusdc",
    category: ActivityCategoryKey.lendingStables,
  },
  {
    id: "weft_lend_xusdc",
    category: ActivityCategoryKey.lendingStables,
  },

  // Network activities
  {
    id: "txFees",
    category: ActivityCategoryKey.transactionFees,
  },

  // Season multiplier Hodl XRD activities for native assets
  {
    id: "hold_xrd",
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: "hold_stakedXrd",
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: "hold_unstakedXrd",
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: "hold_lsulp",
    category: ActivityCategoryKey.maintainXrdBalance,
  },

  // Season multiplier Hodl XRD activities through DEX LP positions
  {
    id: "c9_hold_xrd-xusdc",
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: "defiPlaza_hold_xrd-xusdc",
    category: ActivityCategoryKey.maintainXrdBalance,
  },

  // Season multiplier Hodl activities XRD activities through lending positions
  {
    id: "root_hold_xrd",
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: "root_hold_lsulp",
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: "weft_hold_xrd",
    category: ActivityCategoryKey.maintainXrdBalance,
  },
  {
    id: "weft_hold_lsulp",
    category: ActivityCategoryKey.maintainXrdBalance,
  },

  // Common activities, such as withdrawals and deposits
  {
    id: "common",
    category: ActivityCategoryKey.common,
  },
];

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

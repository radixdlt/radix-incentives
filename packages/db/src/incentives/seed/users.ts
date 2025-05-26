import { usersData } from "./data/usersData";
import { accountsData } from "./data/accountsData";
import {
  accounts,
  activities,
  activityWeeks,
  seasons,
  user,
  users,
  weeks,
} from "../schema";
import { db } from "../client";
import { sql } from "drizzle-orm";

await db
  .insert(users)
  .values(
    usersData.map((user) => ({
      identityAddress: user.identity_address,
      createdAt: new Date(user.created_at),
      label: user.label,
      id: user.id,
      userId: user.id,
    }))
  )
  .onConflictDoNothing();

console.log("Users seeded");

await db
  .insert(accounts)
  .values(
    accountsData.map((account) => ({
      address: account.address,
      createdAt: new Date(account.created_at),
      label: account.label,
      userId: account.user_id,
    }))
  )
  .onConflictDoNothing();

console.log("Accounts seeded");

const [seasonResult] = await db
  .insert(seasons)
  .values([
    {
      startDate: new Date("2025-05-01:00:00:00Z"),
      endDate: new Date("2025-06-30:23:59:59Z"),
      name: "Season 1",
      status: "active",
    },
  ])
  .returning()
  .onConflictDoNothing();

console.log("Season seeded", seasonResult);

const [weekResult] = await db
  .insert(weeks)
  .values([
    {
      startDate: new Date("2025-05-01:00:00:00Z"),
      endDate: new Date("2025-05-07:23:59:59Z"),
      seasonId: seasonResult.id,
    },
  ])
  .returning()
  .onConflictDoNothing();

console.log("Week seeded", weekResult);

const [lendingActivityResult, liquidityActivityResult] = await db
  .insert(activities)
  .values([
    {
      id: "lending",
      name: "Use a lending market",
      type: "active",
      rewardType: "points",
      category: "lending",
      rules: {},
    },
    {
      id: "provideLiquidityToDex",
      name: "Provide liquidity to a DEX",
      type: "active",
      rewardType: "points",
      category: "liquidity",
      rules: {},
    },
  ])
  .returning()
  .onConflictDoUpdate({
    target: [activities.id],
    set: {
      name: sql`excluded.name`,
    },
  });

console.log("Activities seeded", [
  lendingActivityResult,
  liquidityActivityResult,
]);

const [activityWeekResult] = await db
  .insert(activityWeeks)
  .values([
    {
      activityId: lendingActivityResult.id,
      weekId: weekResult.id,
      pointsPool: 500_000,
      status: "active",
    },
    {
      activityId: liquidityActivityResult.id,
      weekId: weekResult.id,
      pointsPool: 1_000_000,
      status: "active",
    },
  ])
  .returning()
  .onConflictDoNothing();

console.log("ActivityWeeks seeded", activityWeekResult);

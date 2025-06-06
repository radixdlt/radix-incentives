import { usersData } from "./data/usersData";
import { accountsData } from "./data/accounts30KData";
import {
  accounts,
  activities,
  activityWeeks,
  seasons,
  users,
  weeks,
} from "../schema";
import { db } from "../client";
import { sql } from "drizzle-orm";

const chunker = <T>(array: T[], size: number) => {
  return array.reduce((acc, item, index) => {
    const chunkIndex = Math.floor(index / size);
    if (!acc[chunkIndex]) {
      acc[chunkIndex] = [];
    }
    acc[chunkIndex].push(item);
    return acc;
  }, [] as T[][]);
};

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

const chunkSize = 1000; // Adjust the chunk size as needed
const chunks = chunker(accountsData, chunkSize);
for (const chunk of chunks) {
  await db
    .insert(accounts)
    .values(
      chunk.map((account) => ({
        address: account.address,
        createdAt: new Date(account.created_at),
        label: account.label,
        userId: account.user_id,
      }))
    )
    .onConflictDoNothing();
}

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
      startDate: new Date("2025-05-19:00:00:00Z"),
      endDate: new Date("2025-05-26:00:00:00Z"),
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

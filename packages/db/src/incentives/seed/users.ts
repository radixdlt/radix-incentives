import { accountsData } from "./data/accountsWeftV2xUsdcHoldersData"
import activitiesData from "./data/100activities.json"
import {
  accounts,
  activities,
  activityWeeks,
  seasons,
  users,
  weeks,
  type Activity,
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

const CHUNK_SIZE = 1000; // Adjust the chunk size as needed

const numberOfUsers = accountsData.length;

const WEEK_ID = "6b209cf9-5932-487e-bf75-9d6f7d2330dd";
const SEASON_ID = "036031e3-8bfb-4d2f-b653-f05c76f07704";

const usersToSeed = new Array(numberOfUsers).fill(0).map((_, index) => ({
  identityAddress: `user-${index}`,
  createdAt: new Date("2025-01-01:00:00:00Z"),
  label: `User ${index}`,
  id: crypto.randomUUID(),
}));

const userChunks = chunker(usersToSeed, CHUNK_SIZE);

for (const userChunk of userChunks) {
  await db.insert(users).values(userChunk).onConflictDoNothing();
}

console.log("Users seeded");

const accountsToSeed = accountsData.map((account, index) => ({
  address: account.address,
  createdAt: new Date(account.created_at),
  label: account.label,
  userId: usersToSeed[index].id,
}));

const accountsChunks = chunker(accountsToSeed, CHUNK_SIZE);

for (const accountChunk of accountsChunks) {
  await db.insert(accounts).values(accountChunk).onConflictDoNothing();
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
      startDate: new Date("2025-06-12:00:00:00Z"),
      endDate: new Date("2025-06-19:00:00:00Z"),
      seasonId: SEASON_ID,
      id: WEEK_ID,
    }
  ])
  .returning()
  .onConflictDoNothing();

console.log("Week seeded", weekResult);

const activitiesResults = await db
  .insert(activities)
  .values(activitiesData as Array<Omit<Activity, "description">>)
  .returning()
  .onConflictDoUpdate({
    target: [activities.id],
    set: {
      name: sql`excluded.name`,
      category: sql`excluded.category`,
      type: sql`excluded.type`,
      rewardType: sql`excluded.reward_type`,
      rules: sql`excluded.rules`,
    },
  });

console.log("Activities seeded", activitiesResults);

// Find specific activities by ID for activityWeeks
const lendingActivity = activitiesResults.find(a => a.id === "lending");
const liquidityActivity = activitiesResults.find(a => a.id === "provideLiquidityToDex");

if (!lendingActivity || !liquidityActivity) {
  throw new Error("Required activities not found in results");
}

const activityWeekResults = await db
  .insert(activityWeeks)
  .values([
    {
      activityId: lendingActivity.id,
      weekId: WEEK_ID,
      pointsPool: 500_000,
      status: "active",
    },
    {
      activityId: liquidityActivity.id,
      weekId: WEEK_ID,
      pointsPool: 1_000_000,
      status: "active",
    },
  ])
  .returning()
  .onConflictDoNothing();

console.log("ActivityWeeks seeded", activityWeekResults);

console.log("Users and accounts successfully seeded");

process.exit(0);

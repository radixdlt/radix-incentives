import { accountsData } from "./data/accounts250KData";
import { accounts, users } from "../schema";
import { db } from "../client";

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

process.exit(0);

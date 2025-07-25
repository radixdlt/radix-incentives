#!/usr/bin/env tsx

import { Effect, Layer } from "effect";
import { LeaderboardCacheService } from "api/incentives/leaderboard/leaderboardCache";
import { createDbClientLive } from "api/incentives/db/dbClient";
import { dbClient } from "api/incentives";
import { z } from "zod";

const argsSchema = z.object({
  weekId: z.string().uuid("Week ID must be a valid UUID"),
});

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Usage: pnpm cache:week <week-id>");
  console.error("Example: pnpm cache:week 123e4567-e89b-12d3-a456-426614174000");
  process.exit(1);
}

const parseResult = argsSchema.safeParse({ weekId: args[0] });
if (!parseResult.success) {
  console.error("❌ Invalid arguments:");
  parseResult.error.errors.forEach(err => {
    console.error(`  ${err.path.join('.')}: ${err.message}`);
  });
  process.exit(1);
}

const { weekId } = parseResult.data;

const program = Effect.gen(function* () {
  console.log(`🚀 Starting leaderboard cache population for week: ${weekId}`);
  
  const leaderboardCacheService = yield* LeaderboardCacheService;
  
  yield* leaderboardCacheService.populateAll({
    weekId,
    force: true
  });
  
  console.log("✅ Week leaderboard cache population completed successfully!");
});

const dbClientLive = createDbClientLive(dbClient);
const leaderboardCacheServiceLive = LeaderboardCacheService.Default.pipe(
  Layer.provide(dbClientLive)
);

const runnable = Effect.provide(program, leaderboardCacheServiceLive);

Effect.runPromiseExit(runnable).then((result) => {
  if (result._tag === "Success") {
    process.exit(0);
  } else {
    console.error("❌ Failed to populate week leaderboard cache:");
    console.error(result.cause);
    process.exit(1);
  }
});
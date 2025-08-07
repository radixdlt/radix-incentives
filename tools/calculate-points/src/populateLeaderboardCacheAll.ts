#!/usr/bin/env tsx

import { dbClient } from 'api/incentives';
import { createDbClientLive } from 'api/incentives/db/dbClient';
import { LeaderboardCacheService } from 'api/incentives/leaderboard/leaderboardCache';
import { Effect, Layer } from 'effect';

const program = Effect.gen(function* () {
  console.log(
    '🚀 Starting leaderboard cache population for ALL seasons and weeks...',
  );

  const leaderboardCacheService = yield* LeaderboardCacheService;

  yield* leaderboardCacheService.populateAll({});

  console.log('✅ Leaderboard cache population completed successfully!');
});

const dbClientLive = createDbClientLive(dbClient);
const leaderboardCacheServiceLive = LeaderboardCacheService.Default.pipe(
  Layer.provide(dbClientLive),
);

const runnable = Effect.provide(program, leaderboardCacheServiceLive);

Effect.runPromiseExit(runnable).then((result) => {
  if (result._tag === 'Success') {
    process.exit(0);
  } else {
    console.error('❌ Failed to populate leaderboard cache:');
    console.error(result.cause);
    process.exit(1);
  }
});

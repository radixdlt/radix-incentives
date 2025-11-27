import { LeaderboardCacheService } from 'api/incentives';
import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import type { Job } from 'bullmq';
import { Effect } from 'effect';
import { handleExit } from '../../helpers/handleExit';
import {
  type PopulateLeaderboardCacheInput,
  populateLeaderboardCacheSchema,
} from './schemas';

export const populateLeaderboardCacheWorker = async (
  input: Job<PopulateLeaderboardCacheInput>,
) => {
  throw new Error('[TEST] Populate leaderboard cache worker intentionally failing for alerting test');
  
  const parsedInput = populateLeaderboardCacheSchema.parse(input.data);

  const exit = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const populateLeaderboardCacheService = yield* LeaderboardCacheService;

      return yield* populateLeaderboardCacheService.populateAll(parsedInput);
    }).pipe(Effect.annotateLogs('jobId', input.id)),
  );

  return handleExit(exit);
};

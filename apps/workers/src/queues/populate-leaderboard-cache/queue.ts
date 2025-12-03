import { Effect } from 'effect';
import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import type { PopulateLeaderboardCacheInput } from './schemas';
import { populateLeaderboardCacheWorker } from './worker';

export const populateLeaderboardCacheQueue = createQueue<
  PopulateLeaderboardCacheInput,
  void
>({
  name: QueueName.populateLeaderboardCache,
  redisClient,
  worker: populateLeaderboardCacheWorker,
  onError: async (job, error) => {
    Effect.runSync(
      Effect.gen(function* () {
        yield* Effect.logError({
          jobId: job?.id,
          jobName: job?.name,
          input: job?.data,
          error: error.message,
          stack: error.stack,
          failedReason: error.cause,
        });
      }),
    );
  },
  workerOptions: {
    connection: redisClient,
    stalledInterval: 180000,
    maxStalledCount: 2,
    lockDuration: 600000, // Lock jobs for 10 minutes
    concurrency: 1, // Process one job at a time to prevent overload and race conditions
  },
});

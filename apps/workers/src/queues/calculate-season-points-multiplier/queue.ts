import type { SeasonPointsMultiplierJob } from 'api/incentives';
import { Effect } from 'effect';
import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import { seasonPointsMultiplierWorker } from './worker';

export const seasonPointsMultiplierQueue = createQueue<
  SeasonPointsMultiplierJob,
  void
>({
  name: QueueName.seasonPointsMultiplier,
  redisClient,
  worker: seasonPointsMultiplierWorker,
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
});

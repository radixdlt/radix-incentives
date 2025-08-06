import { Effect } from 'effect';
import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import type { CalculateSeasonPointsJob } from './schemas';
import { calculateSeasonPointsWorker } from './worker';

export const calculateSeasonPointsQueue = createQueue<
  CalculateSeasonPointsJob,
  void
>({
  name: QueueName.calculateSeasonPoints,
  redisClient,
  worker: calculateSeasonPointsWorker,
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

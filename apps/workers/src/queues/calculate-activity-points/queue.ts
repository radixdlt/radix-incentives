import { Effect } from 'effect';
import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import type { CalculateActivityPointsJob } from './schemas';
import { calculateActivityPointsWorker } from './worker';

export const calculateActivityPointsQueue = createQueue<
  CalculateActivityPointsJob,
  void
>({
  name: QueueName.calculateActivityPoints,
  redisClient,
  worker: calculateActivityPointsWorker,
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

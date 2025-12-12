import type { SeasonRewardWorkerInput } from 'api/incentives/season-reward/seasonRewardWorker';
import { Effect } from 'effect';
import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import { seasonRewardClaimWorker } from './worker';

export const seasonRewardClaimQueue = createQueue<
  SeasonRewardWorkerInput,
  void
>({
  name: QueueName.seasonRewardClaim,
  redisClient,
  worker: seasonRewardClaimWorker,
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

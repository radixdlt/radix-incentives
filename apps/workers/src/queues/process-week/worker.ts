import { SeasonService } from 'api/incentives';
import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import type { Job } from 'bullmq';
import { FlowProducer } from 'bullmq';
import { Effect, Exit } from 'effect';
import { handleExit } from '../../helpers/handleExit';
import { redisClient } from '../../redis';
import { QueueName } from '../types';
import type { ProcessWeekJob } from './schemas';

const flowProducer = new FlowProducer({ connection: redisClient });

export const processWeekWorker = async (job: Job<ProcessWeekJob>) => {
  throw new Error('[TEST] Process week worker intentionally failing for alerting test');
  
  const weekId = job.data.weekId;
  const force = job.data.force ?? false;

  const exit = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const seasonService = yield* SeasonService;
      return yield* seasonService.getByWeekId(weekId);
    }),
  );

  if (Exit.isFailure(exit)) {
    return handleExit(exit);
  }

  const seasonId = exit.value.id;

  job.log(`starting scheduled calculations for weekId: ${weekId}`);

  await flowProducer.add({
    queueName: QueueName.populateLeaderboardCache,
    name: 'process-week',
    data: { weekId },
    opts: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    },
    children: [
      {
        queueName: QueueName.calculateSeasonPoints,
        name: 'process-week',
        data: { weekId, seasonId, markAsProcessed: true, force },
        opts: { failParentOnFailure: true },
        children: [
          {
            queueName: QueueName.seasonPointsMultiplier,
            name: 'process-week',
            data: { weekId },
            opts: { failParentOnFailure: true },
            children: [
              {
                queueName: QueueName.calculateActivityPoints,
                name: 'process-week',
                data: { weekId },
                opts: { failParentOnFailure: true },
              },
            ],
          },
        ],
      },
    ],
  });
};

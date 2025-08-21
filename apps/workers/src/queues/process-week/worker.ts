import { dependencyLayer } from 'api/incentives';
import type { Job } from 'bullmq';
import { FlowProducer } from 'bullmq';
import { Exit } from 'effect';
import { handleExitError } from '../../helpers/handleExitError';
import { redisClient } from '../../redis';
import { QueueName } from '../types';
import type { ProcessWeekJob } from './schemas';

const flowProducer = new FlowProducer({ connection: redisClient });

export const processWeekWorker = async (job: Job<ProcessWeekJob>) => {
  const weekId = job.data.weekId;

  const seasonResult = await dependencyLayer.getSeasonByWeekId(weekId);

  if (Exit.isFailure(seasonResult)) {
    return handleExitError(seasonResult);
  }

  const seasonId = seasonResult.value.id;

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
        data: { weekId, seasonId, markAsProcessed: true },
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

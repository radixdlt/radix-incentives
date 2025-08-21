import { dependencyLayer } from 'api/incentives';
import type { FlowJob, Job } from 'bullmq';
import { FlowProducer } from 'bullmq';
import { Exit } from 'effect';
import { handleExitError } from '../../helpers/handleExitError';
import { redisClient } from '../../redis';
import { QueueName } from '../types';
import type { ScheduledCalculationsJob } from './schemas';
import { processWeekQueue } from '../process-week/queue';

const flowProducer = new FlowProducer({ connection: redisClient });

export const scheduledCalculationsWorker = async (
  job: Job<ScheduledCalculationsJob>,
) => {
  let weekId = job.data.weekId;

  if (!weekId) {
    const timestamp = new Date(job.timestamp);
    job.log(`no weekId provided, getting week by date ${timestamp}`);
    // If no weekId is provided, get the current week by date
    const weekResult = await dependencyLayer.getWeekByDate(timestamp);

    if (Exit.isFailure(weekResult)) {
      return handleExitError(weekResult);
    }
    weekId = weekResult.value.id;
  }

  const unprocessedWeeksResult = await dependencyLayer.getUnprocessedWeeks();

  if (Exit.isFailure(unprocessedWeeksResult)) {
    return handleExitError(unprocessedWeeksResult);
  }

  // Get all weeks that are not processed and have snapshots ran successfully for all accounts
  const unprocessedWeeks = unprocessedWeeksResult.value.filter(
    (week) => week.countsMatch,
  );

  if (unprocessedWeeks.length > 0) {
    for (const week of unprocessedWeeks) {
      job.log(`adding end-of-week-calculation job for weekId: ${week.weekId}`);
      await processWeekQueue.queue.add('process-week', {
        weekId: week.weekId,
      });
    }
  }

  const seasonResult = await dependencyLayer.getSeasonByWeekId(weekId);

  if (Exit.isFailure(seasonResult)) {
    return handleExitError(seasonResult);
  }

  const seasonId = seasonResult.value.id;

  job.log(`starting scheduled calculations for weekId: ${weekId}`);

  const seasonPointsMultiplierJob: FlowJob = {
    name: 'scheduledJob',
    data: { weekId },
    queueName: QueueName.seasonPointsMultiplier,
  };

  // Cache population job (runs after all calculations are complete)
  const cachePopulationJob: FlowJob = {
    name: 'populate-cache',
    data: { weekId },
    queueName: QueueName.populateLeaderboardCache,
    opts: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    },
  };

  const calculateActivityPointsJob: FlowJob = {
    name: 'scheduledJob',
    data: { weekId },
    opts: { failParentOnFailure: true },
    queueName: QueueName.calculateActivityPoints,
  };
  seasonPointsMultiplierJob.children = [calculateActivityPointsJob];

  const calculateSeasonPointsJob: FlowJob = {
    name: 'scheduledJob',
    data: { weekId, seasonId, markAsProcessed: job.data.markAsProcessed },
    queueName: QueueName.calculateSeasonPoints,
  };

  let jobConfig: FlowJob;

  if (job.data.includeSPCalculations) {
    seasonPointsMultiplierJob.opts = { failParentOnFailure: true };
    calculateSeasonPointsJob.children = [seasonPointsMultiplierJob];
    cachePopulationJob.children = [calculateSeasonPointsJob];
    jobConfig = cachePopulationJob;
  } else {
    cachePopulationJob.children = [seasonPointsMultiplierJob];
    jobConfig = cachePopulationJob;
  }

  await flowProducer.add(jobConfig);
};

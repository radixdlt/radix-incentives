import { SeasonService, WeekService } from 'api/incentives';
import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import type { FlowJob, Job } from 'bullmq';
import { FlowProducer } from 'bullmq';
import { Effect, Exit, Option } from 'effect';
import { handleExit } from '../../helpers/handleExit';
import { redisClient } from '../../redis';
import { processWeekQueue } from '../process-week/queue';
import { QueueName } from '../types';
import type { ScheduledCalculationsJob } from './schemas';

const flowProducer = new FlowProducer({ connection: redisClient });

export const scheduledCalculationsWorker = async (
  job: Job<ScheduledCalculationsJob>,
) => {
  throw new Error('[TEST] Scheduled calculations worker intentionally failing for alerting test');
  
  const weekIdResult = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const weekService = yield* WeekService;
      return yield* Option.fromNullable(job.data.weekId).pipe(
        Option.match({
          onSome: (weekId) => Effect.succeed(weekId),
          onNone: () =>
            weekService
              .getByDate(new Date(job.timestamp))
              .pipe(Effect.map((week) => week.id)),
        }),
      );
    }),
  );

  if (Exit.isFailure(weekIdResult)) {
    return handleExit(weekIdResult);
  }

  const weekId = weekIdResult.value;

  const unprocessedWeeksResult = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const weekService = yield* WeekService;
      return yield* weekService.getUnprocessedWeeks();
    }),
  );

  if (Exit.isFailure(unprocessedWeeksResult)) {
    return handleExit(unprocessedWeeksResult);
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

  const seasonResult = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const seasonService = yield* SeasonService;
      return yield* seasonService.getByWeekId(weekId);
    }),
  );

  if (Exit.isFailure(seasonResult)) {
    return handleExit(seasonResult);
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

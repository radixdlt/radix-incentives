import {
  type CalculateActivityPointsJob,
  CalculateActivityPointsWorkerService,
} from 'api/incentives/activity-points/calculateActivityPointsWorker';
import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import type { Job } from 'bullmq';
import { Effect } from 'effect';
import { handleExit } from '../../helpers/handleExit';

export const calculateActivityPointsWorker = async (
  input: Job<CalculateActivityPointsJob>,
) => {
  const exit = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const calculateActivityPointsWorkerService =
        yield* CalculateActivityPointsWorkerService;

      return yield* calculateActivityPointsWorkerService.run({
        weekId: input.data.weekId,
        addresses: input.data.addresses,
        useWeekEndDate: input.data.useWeekEndDate,
      });
    }).pipe(Effect.annotateLogs('jobId', input.id)),
  );

  return handleExit(exit);
};

import {
  type SeasonPointsMultiplierJob,
  SeasonPointsMultiplierWorkerService,
} from 'api/incentives';
import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import type { Job } from 'bullmq';
import { Effect } from 'effect';
import { handleExit } from '../../helpers/handleExit';

export const seasonPointsMultiplierWorker = async (
  input: Job<SeasonPointsMultiplierJob>,
) => {
  const exit = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const calculateSPMultiplierWorkerService =
        yield* SeasonPointsMultiplierWorkerService;

      return yield* calculateSPMultiplierWorkerService({
        weekId: input.data.weekId,
        userIds: input.data.userIds,
      }).pipe(Effect.annotateLogs('jobId', input.id));
    }),
  );

  return handleExit(exit);
};

import { CalculateSeasonPointsService } from 'api/incentives';
import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import type { Job } from 'bullmq';
import { Effect } from 'effect';
import { handleExit } from '../../helpers/handleExit';
import {
  type CalculateSeasonPointsJob,
  calculateSeasonPointsJobSchema,
} from './schemas';

export const calculateSeasonPointsWorker = async (
  input: Job<CalculateSeasonPointsJob>,
) => {
  const parsedInput = calculateSeasonPointsJobSchema.parse(input.data);

  const exit = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const calculateSeasonPointsService = yield* CalculateSeasonPointsService;

      return yield* calculateSeasonPointsService.run({
        ...parsedInput,
        markAsProcessed: !!input.data.markAsProcessed,
      });
    }).pipe(Effect.annotateLogs('jobId', input.id)),
  );

  return handleExit(exit);
};

import {
  SeasonRewardWorker,
  type SeasonRewardWorkerInput,
} from 'api/incentives/season-reward/seasonRewardWorker';
import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import type { Job } from 'bullmq';
import { Effect } from 'effect';
import { handleExit } from '../../helpers/handleExit';

export const seasonRewardClaimWorker = async (
  input: Job<SeasonRewardWorkerInput>,
) => {
  const exit = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const seasonRewardWorker = yield* SeasonRewardWorker;

      yield* seasonRewardWorker.claim(input.data);
    }).pipe(Effect.annotateLogs('jobId', input.id)),
  );

  return handleExit(exit);
};

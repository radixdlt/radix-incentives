import { VesterRefillWorker } from 'api/incentives/season-reward/vesterRefillWorker';
import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import { Effect } from 'effect';
import { handleExit } from '../../helpers/handleExit';

/**
 * Worker that refills all vester components that have automatic refill enabled.
 * This worker is triggered by a cron job every 4 hours.
 */
export const vesterRefillWorker = async () => {
  const exit = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      yield* Effect.log('Starting vester refill worker');

      const vesterRefillService = yield* VesterRefillWorker;
      const result = yield* vesterRefillService.refillAll();

      yield* Effect.log(
        `Vester refill worker completed, refilled ${result.refillCount} seasons`,
      );

      return result;
    }),
  );

  return handleExit(exit);
};

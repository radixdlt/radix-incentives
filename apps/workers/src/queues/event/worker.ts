import { EventWorkerService } from 'api/incentives/events/eventWorker';
import { workerRuntime } from 'api/incentives/snapshot/v2/runtime';
import type { Job } from 'bullmq';
import { Effect } from 'effect';
import { handleExit } from '../../helpers/handleExit';
import { SnapshotPriority } from '../snapshot/constants';
import { snapshotQueue } from '../snapshot/queue';
import type { EventQueueJob } from './schemas';

export const eventQueueWorker = async (input: Job<EventQueueJob>) => {
  const exit = await workerRuntime.runPromiseExit(
    Effect.gen(function* () {
      const eventWorkerService = yield* EventWorkerService;

      return yield* eventWorkerService({
        items: input.data,
        addToSnapshotQueue: async (input) => {
          await snapshotQueue.queue.add('eventSnapshot', input, {
            priority: SnapshotPriority.Event,
          });
        },
      });
    }).pipe(Effect.annotateLogs('jobId', input.id)),
  );

  return handleExit(exit);
};

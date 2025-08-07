import { dependencyLayer } from 'api/incentives';
import type { Job } from 'bullmq';
import { Exit } from 'effect';
import { SnapshotPriority } from '../snapshot/constants';
import { snapshotQueue } from '../snapshot/queue';
import type { EventQueueJob } from './schemas';

export const eventQueueWorker = async (job: Job<EventQueueJob>) => {
  const result = await dependencyLayer.eventWorkerHandler({
    items: job.data,
    addToSnapshotQueue: async (input) => {
      await snapshotQueue.queue.add('eventSnapshot', input, {
        priority: SnapshotPriority.Event,
      });
    },
  });

  if (Exit.isFailure(result)) {
    console.error(
      'error in eventQueueWorker',
      JSON.stringify(result.cause, null, 2),
    );
    throw result.cause;
  }
};

import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import { scheduledSnapshotWorker } from './worker';

export const scheduledSnapshotQueue = createQueue({
  name: QueueName.scheduledSnapshot,
  redisClient,
  worker: scheduledSnapshotWorker,
  onError: async (_, error) => {
    console.error(error);
  },
});

if (process.env.DISABLE_SCHEDULED_SNAPSHOT === 'true') {
  const scheduler =
    await scheduledSnapshotQueue.queue.getJobScheduler('every_hour');
  if (scheduler) {
    await scheduledSnapshotQueue.queue.removeJobScheduler('every_hour');
    console.log('Disabled scheduled snapshots');
  }
} else {
  scheduledSnapshotQueue.queue.upsertJobScheduler('every_hour', {
    pattern: process.env.SCHEDULED_SNAPSHOT_PATTERN || '30 * * * *',
  });
  console.log('Enabled scheduled snapshots');
}

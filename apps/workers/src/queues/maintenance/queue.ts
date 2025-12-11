import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import { maintenanceWorker } from './worker';

export const maintenanceQueue = createQueue({
  name: QueueName.maintenance,
  redisClient,
  worker: maintenanceWorker,
  onError: async (_, error) => {
    console.error('Error in maintenance job:', error);
  },
});

// Schedule to run daily at 3 AM UTC
if (process.env.DISABLE_MAINTENANCE === 'true') {
  const scheduler =
    await maintenanceQueue.queue.getJobScheduler('daily_maintenance');
  if (scheduler) {
    await maintenanceQueue.queue.removeJobScheduler('daily_maintenance');
    console.log('Disabled maintenance job');
  }
} else {
  maintenanceQueue.queue.upsertJobScheduler('daily_maintenance', {
    pattern: '0 3 * * *', // Run at 3 AM UTC every day
  });
  console.log('Enabled maintenance job (daily at 3 AM UTC)');
}

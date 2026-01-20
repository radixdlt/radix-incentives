import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import { vesterRefillWorker } from './worker';

export const vesterRefillQueue = createQueue({
  name: QueueName.vesterRefill,
  redisClient,
  worker: vesterRefillWorker,
  onError: async (_, error) => {
    console.error('Error in vester refill job:', error);
  },
});

// Schedule to run every 4 hours
if (process.env.DISABLE_VESTER_REFILL === 'true') {
  const scheduler =
    await vesterRefillQueue.queue.getJobScheduler('every_four_hours');
  if (scheduler) {
    await vesterRefillQueue.queue.removeJobScheduler('every_four_hours');
    console.log('Disabled vester refill job');
  }
} else {
  vesterRefillQueue.queue.upsertJobScheduler('every_four_hours', {
    pattern: '0 */4 * * *', // Run every 4 hours at the start of the hour
  });
  console.log('Enabled vester refill job (every 4 hours)');
}

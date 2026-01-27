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

// Schedule to run every 30 minutes
if (process.env.DISABLE_VESTER_REFILL === 'true') {
  const scheduler = await vesterRefillQueue.queue.getJobScheduler(
    'every_thirty_minutes',
  );
  if (scheduler) {
    await vesterRefillQueue.queue.removeJobScheduler('every_thirty_minutes');
    console.log('Disabled vester refill job');
  }
} else {
  vesterRefillQueue.queue.upsertJobScheduler('every_thirty_minutes', {
    pattern: '*/30 * * * *',
  });
  console.log('Enabled vester refill job (every 30 minutes)');
}

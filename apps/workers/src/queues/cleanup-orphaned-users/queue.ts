import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import { cleanupOrphanedUsersWorker } from './worker';

export const cleanupOrphanedUsersQueue = createQueue({
  name: QueueName.cleanupOrphanedUsers,
  redisClient,
  worker: cleanupOrphanedUsersWorker,
  onError: async (_, error) => {
    console.error('Error in cleanup orphaned users job:', error);
  },
});

// Schedule to run daily at 3 AM UTC
if (process.env.DISABLE_CLEANUP_ORPHANED_USERS === 'true') {
  const scheduler =
    await cleanupOrphanedUsersQueue.queue.getJobScheduler('daily_cleanup');
  if (scheduler) {
    await cleanupOrphanedUsersQueue.queue.removeJobScheduler('daily_cleanup');
    console.log('Disabled cleanup orphaned users job');
  }
} else {
  cleanupOrphanedUsersQueue.queue.upsertJobScheduler('daily_cleanup', {
    pattern: '0 3 * * *',
  });
  console.log('Enabled cleanup orphaned users job (daily at 3 AM UTC)');
}

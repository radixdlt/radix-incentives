import { Queue } from 'bullmq';
import { redisClient } from '../redis';

export async function removeLockedJob(queueName: string, jobId: string) {
  const queue = new Queue(queueName, {
    connection: redisClient,
  });

  try {
    // Force remove the job
    const job = await queue.getJob(jobId);
    if (job) {
      console.log(`Found job ${jobId}, attempting to remove...`);

      // Try to remove the job
      await job.remove();
      console.log(`Job ${jobId} removed successfully`);
    } else {
      console.log(`Job ${jobId} not found`);

      // Try direct Redis cleanup
      const keys = [
        `bull:${queueName}:${jobId}`,
        `bull:${queueName}:${jobId}:lock`,
        `bull:${queueName}:active`,
        `bull:${queueName}:stalled`,
      ];

      for (const key of keys) {
        await redisClient.del(key);
      }

      // Remove from active list
      await redisClient.lrem(`bull:${queueName}:active`, 0, jobId);

      console.log('Cleaned up Redis keys directly');
    }
  } catch (error) {
    console.error('Error removing job:', error);

    // Force cleanup via Redis
    console.log('Attempting force cleanup...');
    await redisClient.del(`bull:${queueName}:${jobId}:lock`);
    await redisClient.lrem(`bull:${queueName}:active`, 0, jobId);
    console.log('Force cleanup completed');
  } finally {
    await queue.close();
    await redisClient.quit();
  }
}

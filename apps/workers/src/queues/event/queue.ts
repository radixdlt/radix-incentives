import { redisClient } from '../../redis';
import { createQueue } from '../createQueue';
import { QueueName } from '../types';
import type { EventQueueJob } from './schemas';
import { eventQueueWorker } from './worker';

export const eventQueue = createQueue<EventQueueJob, void>({
  name: QueueName.event,
  redisClient,
  worker: eventQueueWorker,
  onError: async (job, error) => {
    console.error(error);
  },
});

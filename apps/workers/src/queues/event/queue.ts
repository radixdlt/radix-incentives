import { createQueue } from "../createQueue";
import { redisClient } from "../../redis";
import { eventQueueWorker } from "./worker";
import type { EventQueueJob } from "./schemas";
import { QueueName } from "../types";

export const eventQueue = createQueue<EventQueueJob, void>({
  name: QueueName.event,
  redisClient,
  worker: eventQueueWorker,
  onError: async (job, error) => {
    console.error(error);
  },
});

import { createQueue } from "../queue/createQueue";
import { redisClient } from "../redis";
import { eventQueueWorker } from "./worker";
import type { EventQueueJob } from "./schemas";

export const eventQueue = createQueue<EventQueueJob, void>({
  name: "event",
  redisClient,
  worker: eventQueueWorker,
  onError: async (job, error) => {
    console.error(error);
  },
});

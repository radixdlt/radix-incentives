import { type Job, Queue, QueueEvents, Worker } from "bullmq";
import type Redis from "ioredis";

export const createQueue = <Input, Output = unknown>(input: {
  name: string;
  redisClient: Redis;
  worker: (job: Job<Input>) => Promise<Output>;
  onError: (err: Error) => Promise<void>;
}) => {
  const queue = new Queue<Input, Output>(input.name, {
    connection: input.redisClient,
  });

  const queueEvents = new QueueEvents(queue.name, {
    connection: input.redisClient,
  });

  const worker = new Worker<Input, Output>(queue.name, input.worker, {
    connection: input.redisClient,
  });

  worker.on("error", input.onError);

  console.log(`${queue.name} queue instantiated`);

  return {
    queue,
    worker,
    queueEvents,
  };
};

import {
  type Job,
  MetricsTime,
  Queue,
  QueueEvents,
  Worker,
  type WorkerOptions,
} from "bullmq";
import { BullMQOtel } from "bullmq-otel";
import type Redis from "ioredis";

export const createQueue = <Input, Output = unknown>(input: {
  name: string;
  redisClient: Redis;
  worker: (job: Job<Input>) => Promise<Output>;
  onError: (
    job: Job<Input, Output, string> | undefined,
    error: Error,
    prev: string
  ) => Promise<void>;
  workerOptions?: WorkerOptions;
}) => {
  const queue = new Queue<Input, Output>(input.name, {
    connection: input.redisClient,
    telemetry: new BullMQOtel(input.name),
  });

  const queueEvents = new QueueEvents(queue.name, {
    connection: input.redisClient,
  });

  const worker = new Worker<Input, Output>(queue.name, input.worker, {
    connection: input.redisClient,
    telemetry: new BullMQOtel(input.name),
    metrics: {
      maxDataPoints: MetricsTime.TWO_WEEKS,
    },
    ...input.workerOptions,
  });

  // prevents nodejs to exit when worker throws an error
  worker.on("error", () => {});

  console.log(`${queue.name} queue instantiated`);

  worker.on("failed", input.onError);
  worker.on("stalled", (jobId) => {
    console.log(`${queue.name} worker stalled for job ${jobId}`);
  });

  return {
    queue,
    worker,
    queueEvents,
  };
};

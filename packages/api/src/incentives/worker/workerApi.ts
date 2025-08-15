import { Config, Data, Effect } from 'effect';

import { z } from 'zod';
import { FetchService } from '../../common';

export const snapshotDateRangeJobSchema = z.object({
  addresses: z.array(z.string()).optional(),
  fromTimestamp: z.string(),
  toTimestamp: z.string(),
  intervalInHours: z.number().optional().default(1),
  addDummyData: z.boolean().optional().default(false),
  includeActivityIds: z.array(z.string()).optional(),
  usdThreshold: z.string().optional(),
  batchSize: z.number().optional(),
});

class AddDateRangeJobError extends Data.TaggedError('AddDateRangeJobError')<{
  message: string;
}> {}

export type SnapshotDateRangeJob = z.infer<typeof snapshotDateRangeJobSchema>;

export class WorkerApiService extends Effect.Service<WorkerApiService>()(
  'WorkerApiService',
  {
    dependencies: [FetchService.Default],
    effect: Effect.gen(function* () {
      const fetchImpl = yield* FetchService;

      return {
        addDateRangeJob: Effect.fn(function* (input: SnapshotDateRangeJob) {
          const workerApiUrl = yield* Config.string('WORKERS_API_BASE_URL');
          const parsedInput = snapshotDateRangeJobSchema.safeParse(input);

          if (!parsedInput.success) {
            throw new Error(parsedInput.error.message);
          }

          const response = yield* Effect.tryPromise(() =>
            fetchImpl(`${workerApiUrl}/queues/snapshot-date-range/add`, {
              method: 'POST',
              body: JSON.stringify(parsedInput.data),
            }),
          );

          if (!response.ok) {
            return yield* Effect.fail(
              new AddDateRangeJobError({
                message: 'Failed to add date range job',
              }),
            );
          }
        }),
        getQueues: Effect.fn(function* () {
          const workerApiUrl = yield* Config.string('WORKERS_API_BASE_URL');
          return yield* Effect.tryPromise(() =>
            fetchImpl(`${workerApiUrl}/ui/api/queues`).then((res) =>
              res.json(),
            ),
          );
        }),
      };
    }),
  },
) {}

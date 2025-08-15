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

class AddSeasonPointsMultiplierJobError extends Data.TaggedError(
  'AddSeasonPointsMultiplierJobError',
)<{
  message: string;
}> {}

class InvalidInputError extends Data.TaggedError('InvalidInputError')<{
  message: string;
}> {}

export const seasonPointsMultiplierJobSchema = z.object({
  weekId: z.string(),
  userIds: z.array(z.string()).optional(),
});

export type SeasonPointsMultiplierJob = z.infer<
  typeof seasonPointsMultiplierJobSchema
>;

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
            return yield* Effect.fail(
              new InvalidInputError({
                message: parsedInput.error.message,
              }),
            );
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
        addSeasonPointsMultiplierJob: Effect.fn(function* (
          input: SeasonPointsMultiplierJob,
        ) {
          const workerApiUrl = yield* Config.string('WORKERS_API_BASE_URL');
          const parsedInput = seasonPointsMultiplierJobSchema.safeParse(input);

          if (!parsedInput.success) {
            return yield* Effect.fail(
              new InvalidInputError({
                message: parsedInput.error.message,
              }),
            );
          }

          const response = yield* Effect.tryPromise(() =>
            fetchImpl(
              `${workerApiUrl}/queues/calculate-season-points-multiplier/add`,
              {
                method: 'POST',
                body: JSON.stringify(parsedInput.data),
              },
            ),
          );

          if (!response.ok) {
            return yield* Effect.fail(
              new AddSeasonPointsMultiplierJobError({
                message: 'Failed to add season points multiplier job',
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

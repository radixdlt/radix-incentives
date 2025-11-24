import { weeks } from 'db/incentives';
import { and, gt, lte } from 'drizzle-orm';
import { Effect } from 'effect';
import { z } from 'zod';
import { DbClientService, DbError, dbClientLive } from '../../db/dbClient';
import { SnapshotV2 } from './snapshotV2';

export const snapshotJobSchema = z.object({
  addresses: z.array(z.string()).optional(),
  timestamp: z.date(),
  addDummyData: z.boolean().optional(),
  jobId: z.string(),
  batchSize: z.number().optional(),
  usdThreshold: z.string().optional(),
  includeActivityIds: z.array(z.string()).optional(),
});

export type SnapshotWorkerInput = z.infer<typeof snapshotJobSchema>;

export class SnapshotV2Worker extends Effect.Service<SnapshotV2Worker>()(
  'SnapshotWorker',
  {
    dependencies: [SnapshotV2.Default, dbClientLive],
    effect: Effect.gen(function* () {
      const snapshotService = yield* SnapshotV2;
      const db = yield* DbClientService;

      return Effect.fn(function* (input: SnapshotWorkerInput) {
        yield* Effect.log(
          `Snapshot started for job: ${input.jobId} at timestamp: ${input.timestamp}`,
        );

        yield* snapshotService(input);

        // If addresses are provided, skip activity points calculation
        if (input.addresses) {
          return;
        }

        const maybeWeek = yield* Effect.tryPromise({
          try: () =>
            db.query.weeks.findFirst({
              where: and(
                lte(weeks.startDate, input.timestamp),
                gt(weeks.endDate, input.timestamp),
              ),
            }),
          catch: (error) => new DbError(error),
        });
        if (!maybeWeek) {
          yield* Effect.log(
            'No week found, skipping activity points calculation',
          );
          return;
        }

        return { weekId: maybeWeek.id };
      });
    }),
  },
) {}

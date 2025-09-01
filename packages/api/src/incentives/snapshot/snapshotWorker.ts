import { weeks } from 'db/incentives';
import { and, gt, lte } from 'drizzle-orm';
import { Effect } from 'effect';
import { z } from 'zod';
import { DbService } from '../db/dbClient';
import { SnapshotService } from './snapshot';

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

export class SnapshotWorkerService extends Effect.Service<SnapshotWorkerService>()(
  'SnapshotWorkerService',
  {
    dependencies: [SnapshotService.Default, DbService.Default],
    effect: Effect.gen(function* () {
      const snapshotService = yield* SnapshotService;
      const db = yield* DbService;

      return Effect.fn(function* (input: SnapshotWorkerInput) {
        yield* Effect.log(
          `Snapshot started for job: ${input.jobId} at timestamp: ${input.timestamp}`,
        );

        yield* snapshotService(input);

        // If addresses are provided, skip activity points calculation
        if (input.addresses) {
          return;
        }

        const maybeWeek = yield* db.query.weeks.findFirst({
          where: and(
            lte(weeks.startDate, input.timestamp),
            gt(weeks.endDate, input.timestamp),
          ),
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

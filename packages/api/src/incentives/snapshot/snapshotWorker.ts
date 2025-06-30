import { Context, Layer, Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { and, gt, lte } from "drizzle-orm";

import { SnapshotService, type SnapshotServiceError } from "./snapshot";

import { z } from "zod";
import { weeks } from "db/incentives";

export const snapshotJobSchema = z.object({
  addresses: z.array(z.string()).optional(),
  timestamp: z.date(),
  addDummyData: z.boolean().optional(),
  jobId: z.string(),
  batchSize: z.number().optional(),
});

export type SnapshotWorkerInput = z.infer<typeof snapshotJobSchema>;

export type SnapshotWorkerError = SnapshotServiceError | DbError;

export class SnapshotWorkerService extends Context.Tag("SnapshotWorkerService")<
  SnapshotWorkerService,
  (
    input: SnapshotWorkerInput
  ) => Effect.Effect<{ weekId: string } | undefined, SnapshotWorkerError>
>() {}

export const SnapshotWorkerLive = Layer.effect(
  SnapshotWorkerService,
  Effect.gen(function* () {
    const snapshotService = yield* SnapshotService;
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        yield* Effect.log("Snapshot started", input);

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
                gt(weeks.endDate, input.timestamp)
              ),
            }),
          catch: (error) => new DbError(error),
        });

        if (!maybeWeek) {
          yield* Effect.log(
            "No week found, skipping activity points calculation"
          );
          return;
        }

        return { weekId: maybeWeek.id };
      });
    };
  })
);

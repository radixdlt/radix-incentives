import { Context, Layer, Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { snapshots, type Snapshot } from "db/incentives";
import { eq } from "drizzle-orm";

export type UpdateSnapshotInput = {
  id: string;
  status: Snapshot["status"];
};

export class UpdateSnapshotService extends Context.Tag("UpdateSnapshotService")<
  UpdateSnapshotService,
  (input: UpdateSnapshotInput) => Effect.Effect<void, DbError>
>() {}

export const UpdateSnapshotLive = Layer.effect(
  UpdateSnapshotService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db
              .update(snapshots)
              .set({
                status: input.status,
                updatedAt: new Date(),
              })
              .where(eq(snapshots.id, input.id)),
          catch: (error) => new DbError(error),
        });
      });
    };
  })
);

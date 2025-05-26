import { Context, Layer, Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { snapshots, type Snapshot } from "db/incentives";

export type CreateSnapshotInput = {
  timestamp: Date;
  status: Snapshot["status"];
};

export class CreateSnapshotService extends Context.Tag("CreateSnapshotService")<
  CreateSnapshotService,
  (
    input: CreateSnapshotInput
  ) => Effect.Effect<Snapshot, DbError, DbClientService>
>() {}

export const CreateSnapshotLive = Layer.effect(
  CreateSnapshotService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        return yield* Effect.tryPromise({
          try: () =>
            db
              .insert(snapshots)
              .values(input)
              .returning()
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              .then((res) => res[0]!),
          catch: (error) => new DbError(error),
        });
      });
  })
);

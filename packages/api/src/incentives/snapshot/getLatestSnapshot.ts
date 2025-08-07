import { type Snapshot, snapshots } from 'db/incentives';
import { desc, inArray } from 'drizzle-orm';
import { Context, Effect, Layer } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';

export type GetLatestSnapshotInput = {
  status: Snapshot['status'][];
};

export class GetLatestSnapshotService extends Context.Tag(
  'GetLatestSnapshotService',
)<
  GetLatestSnapshotService,
  (
    input: GetLatestSnapshotInput,
  ) => Effect.Effect<Snapshot | undefined, DbError>
>() {}

export const GetLatestSnapshotLive = Layer.effect(
  GetLatestSnapshotService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        return yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(snapshots)
              .where(inArray(snapshots.status, input.status))
              .orderBy(desc(snapshots.timestamp))
              .limit(1)
              .then((res) => res[0]),
          catch: (error) => new DbError(error),
        });
      });
  }),
);

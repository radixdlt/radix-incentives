import { Context, Layer, Effect } from "effect";

import { SnapshotService } from "./snapshot";

export type SnapshotWorkerInput = any;
export type SnapshotWorkerOutput = any;
export type SnapshotWorkerError = any;

export class SnapshotWorkerService extends Context.Tag("SnapshotWorkerService")<
  SnapshotWorkerService,
  (
    input: SnapshotWorkerInput
  ) => Effect.Effect<SnapshotWorkerOutput, SnapshotWorkerError>
>() {}

export const SnapshotWorkerLive = Layer.effect(
  SnapshotWorkerService,
  Effect.gen(function* () {
    const snapshotService = yield* SnapshotService;

    return (input) => {
      return Effect.gen(function* () {
        const snapshot = yield* snapshotService(input);
      });
    };
  })
);

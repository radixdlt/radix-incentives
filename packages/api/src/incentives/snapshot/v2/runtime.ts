import { Layer, ManagedRuntime } from 'effect';
import { SnapshotV2Worker } from './snapshotV2Worker';

export const workerRuntime = ManagedRuntime.make(
  Layer.mergeAll(SnapshotV2Worker.Default),
);

import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SnapshotV2 } from 'api/incentives/snapshot/v2/snapshotV2';
import { Effect, Logger } from 'effect';

export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'snapshot' },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: 'http://127.0.0.1:4318/v1/traces',
    }),
  ),
}));

// const snapshotV1Runnable = Effect.gen(function* () {
//   const snapshot = yield* SnapshotService;

//   const start = performance.now();

//   yield* snapshot({
//     timestamp: new Date('2025-09-01T00:00:00.000Z'),
//     batchSize: 10_000,
//     addDummyData: false,
//   });

//   const end = performance.now();
//   console.log(`Snapshot took ${end - start} milliseconds`);
// }).pipe(
//   Effect.provide(SnapshotService.Default),
//   Effect.provide(SnapshotV2.Default),
//   Effect.provide(NodeSdkLive),
// );

// await Effect.runPromise(snapshotV1Runnable.pipe(Effect.provide(Logger.pretty)));

const snapshotV2Runnable = Effect.gen(function* () {
  const snapshotV2 = yield* SnapshotV2;

  const start = performance.now();

  yield* snapshotV2({
    timestamp: new Date('2025-09-01T00:00:00.000Z'),
    batchSize: 10_000,
    addDummyData: false,
  });

  const end = performance.now();
  yield* Effect.log(`SnapshotV2 took ${end - start} milliseconds`);
}).pipe(Effect.provide(SnapshotV2.Default), Effect.provide(NodeSdkLive));

await Effect.runPromise(snapshotV2Runnable.pipe(Effect.provide(Logger.pretty)));

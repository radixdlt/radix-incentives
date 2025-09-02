import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SnapshotService } from 'api/incentives';
import { Effect, Logger } from 'effect';

export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'snapshot' },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: 'http://127.0.0.1:4318/v1/traces',
    }),
  ),
}));

const runnable = Effect.gen(function* () {
  const service = yield* SnapshotService;

  yield* service({
    timestamp: new Date('2025-09-01T00:00:00.000Z'),
    batchSize: 10_000,
    addDummyData: false,
  });
}).pipe(Effect.provide(SnapshotService.Default), Effect.provide(NodeSdkLive));

await Effect.runPromise(runnable.pipe(Effect.provide(Logger.pretty)));

import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Effect, Logger } from 'effect';
import {
  type GetLedgerStateInput,
  GetLedgerStateService,
} from '../common/gateway/getLedgerState';

import { CalculateActivityPointsWorkerService } from './activity-points/calculateActivityPointsWorker';

import { createConfig } from './config/appConfig';
import {
  type DeriveAccountFromEventInput,
  DeriveAccountFromEventService,
} from './events/deriveAccountFromEvent';
import {
  type EventWorkerInput,
  EventWorkerService,
} from './events/eventWorker';

import { LeaderboardCacheService } from './leaderboard/leaderboardCache';
import { SeasonService } from './season/season';

import { SeasonPointsMultiplierWorkerService } from './season-point-multiplier/seasonPointsMultiplierWorker';

import { CalculateSeasonPointsService } from './season-points/calculateSeasonPoints';
import {
  type SnapshotWorkerInput,
  SnapshotWorkerService,
} from './snapshot/snapshotWorker';

import { WeekService } from './week/week';

const appConfig = createConfig();

export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'api' },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: `${appConfig.otlpBaseUrl}/v1/traces`,
    }),
  ),
}));

const snapshotWorker = (input: SnapshotWorkerInput) => {
  const program = Effect.gen(function* () {
    const snapshotService = yield* SnapshotWorkerService;

    const baseEffect = snapshotService(input).pipe(Effect.withSpan('snapshot'));

    return yield* process.env.PRETTY_LOGGING === 'true'
      ? baseEffect.pipe(Effect.provide(Logger.pretty))
      : baseEffect;
  }).pipe(Effect.provide(SnapshotWorkerService.Default));

  return Effect.runPromiseExit(program);
};

const getLedgerState = (input: GetLedgerStateInput) => {
  const program = Effect.gen(function* () {
    const getLedgerStateService = yield* GetLedgerStateService;

    return yield* getLedgerStateService(input);
  }).pipe(Effect.provide(GetLedgerStateService.Default));

  return Effect.runPromiseExit(program);
};

const eventWorkerHandler = (input: EventWorkerInput) => {
  const program = Effect.gen(function* () {
    const eventWorkerService = yield* EventWorkerService;

    return yield* eventWorkerService(input);
  }).pipe(Effect.provide(EventWorkerService.Default));

  return Effect.runPromiseExit(program);
};

const deriveAccountFromEvent = (input: DeriveAccountFromEventInput) => {
  const program = Effect.gen(function* () {
    const deriveAccountFromEventService = yield* DeriveAccountFromEventService;

    return yield* deriveAccountFromEventService(input);
  }).pipe(Effect.provide(DeriveAccountFromEventService.Default));

  return Effect.runPromiseExit(program);
};

const calculateActivityPoints = (input: {
  weekId: string;
  useWeekEndDate: boolean;
  addresses?: string[];
}) => {
  const program = Effect.gen(function* () {
    const calculateActivityPointsWorkerService =
      yield* CalculateActivityPointsWorkerService;

    return yield* calculateActivityPointsWorkerService.run({
      weekId: input.weekId,
      useWeekEndDate: input.useWeekEndDate,
      addresses: input.addresses,
    });
  }).pipe(
    Effect.provide(CalculateActivityPointsWorkerService.Default),
    Effect.provide(NodeSdkLive),
  );

  return Effect.runPromiseExit(program);
};

const calculateSeasonPoints = (input: {
  weekId: string;
  markAsProcessed?: boolean;
}) => {
  const program = Effect.gen(function* () {
    const calculateSeasonPointsService = yield* CalculateSeasonPointsService;

    return yield* calculateSeasonPointsService.run({
      ...input,
      markAsProcessed: !!input.markAsProcessed,
    });
  }).pipe(Effect.provide(CalculateSeasonPointsService.Default));

  return Effect.runPromiseExit(program);
};

const calculateSPMultiplier = (input: {
  weekId: string;
  userIds?: string[];
}) => {
  const program = Effect.gen(function* () {
    const calculateSPMultiplierWorkerService =
      yield* SeasonPointsMultiplierWorkerService;

    return yield* calculateSPMultiplierWorkerService(input);
  }).pipe(
    Effect.provide(SeasonPointsMultiplierWorkerService.Default),
    Effect.provide(NodeSdkLive),
  );

  return Effect.runPromiseExit(program);
};

const getWeekByDate = (date: Date) => {
  const program = Effect.gen(function* () {
    const weekService = yield* WeekService;

    return yield* weekService.getByDate(date);
  }).pipe(Effect.provide(WeekService.Default));

  return Effect.runPromiseExit(program);
};

const getSeasonByWeekId = (weekId: string) => {
  const program = Effect.gen(function* () {
    const seasonService = yield* SeasonService;

    return yield* seasonService.getByWeekId(weekId);
  }).pipe(Effect.provide(SeasonService.Default));

  return Effect.runPromiseExit(program);
};

const populateLeaderboardCache = (input: { weekId?: string }) => {
  const program = Effect.gen(function* () {
    const leaderboardCacheService = yield* LeaderboardCacheService;
    return yield* leaderboardCacheService.populateAll(input);
  }).pipe(Effect.provide(LeaderboardCacheService.Default));

  return Effect.runPromiseExit(program);
};

const getUnprocessedWeeks = () => {
  const runnable = Effect.gen(function* () {
    const weekService = yield* WeekService;
    return yield* weekService.getUnprocessedWeeks();
  }).pipe(Effect.provide(WeekService.Default));

  return Effect.runPromiseExit(runnable);
};

export const dependencyLayer = {
  snapshotWorker,
  getLedgerState,
  deriveAccountFromEvent,
  calculateActivityPoints,
  calculateSeasonPoints,
  calculateSPMultiplier,
  eventWorkerHandler,
  getWeekByDate,
  getSeasonByWeekId,
  populateLeaderboardCache,
  getUnprocessedWeeks,
};

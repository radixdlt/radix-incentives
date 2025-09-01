import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { db, readOnlyDb } from 'db/incentives';
import { Effect, Layer, Logger } from 'effect';
import { GatewayApiClientLive } from '../common/gateway/gatewayApiClient';
import { GetAddressByNonFungibleService } from '../common/gateway/getAddressByNonFungible';
import {
  type GetLedgerStateInput,
  GetLedgerStateService,
} from '../common/gateway/getLedgerState';
import { GetNonFungibleLocationService } from '../common/gateway/getNonFungibleLocation';
import { AccountAddressService } from './account/accountAddressService';
import { GetAccountAddressByUserIdLive } from './account/getAccountAddressByUserId';
import { GetAccountAddressesService } from './account/getAccounts';
import { GetAccountsIntersectionLive } from './account/getAccountsIntersection';
import { AccountBalanceService } from './account-balance/accountBalance';
import { GetActivitiesByWeekIdLive } from './activity/getActivitiesByWeekId';
import { ActivityCategoryWeekService } from './activity-category-week/activityCategoryWeek';
import { CalculateActivityPointsLive } from './activity-points/calculateActivityPoints';
import {
  CalculateActivityPointsWorkerLive,
  CalculateActivityPointsWorkerService,
} from './activity-points/calculateActivityPointsWorker';
import { CalculateTWASQLLive } from './activity-points/calculateTWASQL';
import { UpsertAccountActivityPointsLive } from './activity-points/upsertAccountActivityPoints';
import { ActivityWeekService } from './activity-week/activityWeek';
import { ComponentWhitelistService } from './component/componentWhitelist';
import { GetComponentCallsPaginatedLive } from './component/getComponentCalls';
import { createAppConfigLive, createConfig } from './config/appConfig';
import { createDbClientLive, createDbReadOnlyClientLive } from './db/dbClient';
import {
  type DeriveAccountFromEventInput,
  DeriveAccountFromEventLive,
  DeriveAccountFromEventService,
} from './events/deriveAccountFromEvent';
import {
  type EventWorkerInput,
  EventWorkerLive,
  EventWorkerService,
} from './events/eventWorker';
import { GetEventsFromDbLive } from './events/queries/getEventsFromDb';
import { LeaderboardCacheService } from './leaderboard/leaderboardCache';
import { GetSeasonByIdLive } from './season/getSeasonById';
import { SeasonService } from './season/season';
import { GetSeasonPointMultiplierService } from './season-point-multiplier/getSeasonPointMultiplier';
import { GetUserTWAXrdBalanceLive } from './season-point-multiplier/getUserTWAXrdBalance';
import {
  SeasonPointsMultiplierWorkerService,
  SeasonPointsMultiplierWorkerServiceLive,
} from './season-point-multiplier/seasonPointsMultiplierWorker';
import { UpsertUserTwaWithMultiplierLive } from './season-point-multiplier/upsertUserTwaWithMultiplier';
import { AddSeasonPointsToUserService } from './season-points/addSeasonPointsToUser';
import { CalculateSeasonPointsService } from './season-points/calculateSeasonPoints';
import {
  type SnapshotWorkerInput,
  SnapshotWorkerService,
} from './snapshot/snapshotWorker';
import { GetUsdValueLive } from './token-price/getUsdValue';
import { GetTradingVolumeLive } from './trading-volume/getTradingVolume';
import { GetTransactionFeesPaginatedLive } from './transaction-fee/getTransactionFees';
import { GetUsersPaginatedLive } from './user/getUsersPaginated';
import { UserActivityPointsService } from './user/userActivityPoints';
import { GetWeekByIdLive } from './week/getWeekById';
import { UpdateWeekStatusService } from './week/updateWeekStatus';
import { WeekService } from './week/week';

const appConfig = createConfig();

const dbClientLive = createDbClientLive(db);
const dbReadOnlyClientLive = createDbReadOnlyClientLive(readOnlyDb);

const _gatewayApiClientLive = GatewayApiClientLive;

const getLedgerStateLive = GetLedgerStateService.Default;

const getAccountAddressesLive = GetAccountAddressesService.Default;

const getUsdValueLive = GetUsdValueLive;

const _getNonFungibleLocationLive = GetNonFungibleLocationService.Default;

const getEventsFromDbLive = GetEventsFromDbLive.pipe(
  Layer.provide(dbClientLive),
);

const getAddressByNonFungibleLive = GetAddressByNonFungibleService.Default;

const getAccountsIntersectionLive = GetAccountsIntersectionLive.pipe(
  Layer.provide(dbClientLive),
);

const deriveAccountFromEventLive = DeriveAccountFromEventLive.pipe(
  Layer.provide(getEventsFromDbLive),
  Layer.provide(getAddressByNonFungibleLive),
  Layer.provide(getAccountsIntersectionLive),
);

const upsertAccountActivityPointsLive = UpsertAccountActivityPointsLive.pipe(
  Layer.provide(dbClientLive),
);

const upsertUserTwaWithMultiplierLive = UpsertUserTwaWithMultiplierLive.pipe(
  Layer.provide(dbClientLive),
);

const getWeekByIdLive = GetWeekByIdLive.pipe(Layer.provide(dbClientLive));

const accountBalanceServiceLive = AccountBalanceService.Default.pipe(
  Layer.provide(dbClientLive),
);

const getTransactionFeesPaginatedLive = GetTransactionFeesPaginatedLive.pipe(
  Layer.provide(dbClientLive),
);

const getAccountAddressByUserIdLive = GetAccountAddressByUserIdLive.pipe(
  Layer.provide(dbClientLive),
);

const componentWhitelistLive = ComponentWhitelistService.Default.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(createAppConfigLive()),
);

const getComponentCallsPaginatedLive = GetComponentCallsPaginatedLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getAccountAddressByUserIdLive),
  Layer.provide(componentWhitelistLive),
);

const getTradingVolumeLive = GetTradingVolumeLive.pipe(
  Layer.provide(dbClientLive),
);

const calculateTWASQLLive = CalculateTWASQLLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(dbReadOnlyClientLive),
);

const calculateActivityPointsLive = CalculateActivityPointsLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(upsertAccountActivityPointsLive),
  Layer.provide(getWeekByIdLive),
  Layer.provide(calculateTWASQLLive),
  Layer.provide(getTransactionFeesPaginatedLive),
  Layer.provide(getComponentCallsPaginatedLive),
  Layer.provide(getTradingVolumeLive),
);

const accountAddressService = AccountAddressService.Default.pipe(
  Layer.provide(dbClientLive),
);

const calculateActivityPointsWorkerLive =
  CalculateActivityPointsWorkerLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(calculateActivityPointsLive),
    Layer.provide(getWeekByIdLive),
    Layer.provide(getTransactionFeesPaginatedLive),
    Layer.provide(accountAddressService),
  );

const getSeasonByIdLive = GetSeasonByIdLive.pipe(Layer.provide(dbClientLive));
const getActivitiesByWeekIdLive = GetActivitiesByWeekIdLive.pipe(
  Layer.provide(dbClientLive),
);
const getUserActivityPointsLive = UserActivityPointsService.Default.pipe(
  Layer.provide(dbClientLive),
);

const getUsersPaginatedLive = GetUsersPaginatedLive.pipe(
  Layer.provide(dbClientLive),
);

const addSeasonPointsToUserLive = AddSeasonPointsToUserService.Default.pipe(
  Layer.provide(dbClientLive),
);
const updateWeekStatusLive = UpdateWeekStatusService.Default.pipe(
  Layer.provide(dbClientLive),
);
const getSeasonPointMultiplierLive =
  GetSeasonPointMultiplierService.Default.pipe(Layer.provide(dbClientLive));

const activityCategoryWeekServiceLive =
  ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive));

const seasonServiceLive = SeasonService.Default.pipe(
  Layer.provide(dbClientLive),
);

const activityWeekServiceLive = ActivityWeekService.Default.pipe(
  Layer.provide(dbClientLive),
);

const weekServiceLive = WeekService.Default.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(activityCategoryWeekServiceLive),
  Layer.provide(activityWeekServiceLive),
);

const calculateSeasonPointsLive = CalculateSeasonPointsService.Default.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getSeasonByIdLive),
  Layer.provide(getWeekByIdLive),
  Layer.provide(getActivitiesByWeekIdLive),
  Layer.provide(getUserActivityPointsLive),
  Layer.provide(getUsersPaginatedLive),
  Layer.provide(addSeasonPointsToUserLive),
  Layer.provide(updateWeekStatusLive),
  Layer.provide(getSeasonPointMultiplierLive),
  Layer.provide(activityCategoryWeekServiceLive),
  Layer.provide(seasonServiceLive),
  Layer.provide(weekServiceLive),
);

const calculateSPMultiplierLive = GetUserTWAXrdBalanceLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(getWeekByIdLive),
  Layer.provide(getSeasonByIdLive),
  Layer.provide(getAccountAddressesLive),
  Layer.provide(upsertUserTwaWithMultiplierLive),
  Layer.provide(getActivitiesByWeekIdLive),
  Layer.provide(calculateTWASQLLive),
);

const seasonPointsMultiplierWorkerLive =
  SeasonPointsMultiplierWorkerServiceLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(calculateSPMultiplierLive),
    Layer.provide(getWeekByIdLive),
    Layer.provide(upsertUserTwaWithMultiplierLive),
    Layer.provide(accountBalanceServiceLive),
    Layer.provide(getUsdValueLive),
  );

export const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: 'api' },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: `${appConfig.otlpBaseUrl}/v1/traces`,
    }),
  ),
}));

const snapshotWorker = (input: SnapshotWorkerInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const snapshotService = yield* SnapshotWorkerService;

      const baseEffect = snapshotService(input).pipe(
        Effect.withSpan('snapshot'),
      );

      return yield* process.env.PRETTY_LOGGING === 'true'
        ? baseEffect.pipe(Effect.provide(Logger.pretty))
        : baseEffect;
    }),
    SnapshotWorkerService.Default,
  );

  return Effect.runPromiseExit(program);
};

const getLedgerState = (input: GetLedgerStateInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const getLedgerStateService = yield* GetLedgerStateService;

      return yield* getLedgerStateService(input);
    }),
    getLedgerStateLive,
  );

  return Effect.runPromiseExit(program);
};

const eventWorkerLive = EventWorkerLive.pipe(
  Layer.provide(dbClientLive),
  Layer.provide(deriveAccountFromEventLive),
);

const eventWorkerHandler = (input: EventWorkerInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const eventWorkerService = yield* EventWorkerService;

      return yield* eventWorkerService(input);
    }),
    eventWorkerLive,
  );

  return Effect.runPromiseExit(program);
};

const deriveAccountFromEvent = (input: DeriveAccountFromEventInput) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const deriveAccountFromEventService =
        yield* DeriveAccountFromEventService;

      return yield* deriveAccountFromEventService(input);
    }),
    deriveAccountFromEventLive,
  );

  return Effect.runPromiseExit(program);
};

const calculateActivityPoints = (input: {
  weekId: string;
  useWeekEndDate: boolean;
  addresses?: string[];
}) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const calculateActivityPointsWorkerService =
        yield* CalculateActivityPointsWorkerService;

      return yield* calculateActivityPointsWorkerService.run({
        weekId: input.weekId,
        useWeekEndDate: input.useWeekEndDate,
        addresses: input.addresses,
      });
    }),
    calculateActivityPointsWorkerLive,
  ).pipe(
    Effect.withSpan('calculateActivityPoints'),
    Effect.provide(NodeSdkLive),
  );

  return Effect.runPromiseExit(program);
};

const calculateSeasonPoints = (input: {
  weekId: string;
  markAsProcessed?: boolean;
}) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const calculateSeasonPointsService = yield* CalculateSeasonPointsService;

      return yield* calculateSeasonPointsService.run({
        ...input,
        markAsProcessed: !!input.markAsProcessed,
      });
    }),
    calculateSeasonPointsLive,
  );

  return Effect.runPromiseExit(program);
};

const calculateSPMultiplier = (input: {
  weekId: string;
  userIds?: string[];
}) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const calculateSPMultiplierWorkerService =
        yield* SeasonPointsMultiplierWorkerService;

      return yield* calculateSPMultiplierWorkerService(input);
    }),
    seasonPointsMultiplierWorkerLive,
  ).pipe(Effect.provide(NodeSdkLive));

  return Effect.runPromiseExit(program);
};

const getWeekByDate = (date: Date) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const weekService = yield* WeekService;

      return yield* weekService.getByDate(date);
    }),
    weekServiceLive,
  );

  return Effect.runPromiseExit(program);
};

const getSeasonByWeekId = (weekId: string) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const seasonService = yield* SeasonService;

      return yield* seasonService.getByWeekId(weekId);
    }),
    SeasonService.Default.pipe(Layer.provide(dbClientLive)),
  );

  return Effect.runPromiseExit(program);
};

const populateLeaderboardCache = (input: { weekId?: string }) => {
  const program = Effect.provide(
    Effect.gen(function* () {
      const leaderboardCacheService = yield* LeaderboardCacheService;
      return yield* leaderboardCacheService.populateAll(input);
    }),
    LeaderboardCacheService.Default.pipe(
      Layer.provide(dbClientLive),
      Layer.provide(SeasonService.Default.pipe(Layer.provide(dbClientLive))),
      Layer.provide(weekServiceLive),
      Layer.provide(
        ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive)),
      ),
      Layer.provide(activityWeekServiceLive),
    ),
  );

  return Effect.runPromiseExit(program);
};

const getUnprocessedWeeks = () => {
  const runnable = Effect.gen(function* () {
    const weekService = yield* WeekService;
    return yield* weekService.getUnprocessedWeeks();
  }).pipe(Effect.provide(weekServiceLive));

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

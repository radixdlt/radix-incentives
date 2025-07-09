import type { Db, Week } from "db/incentives";
import {
  type AppConfig,
  createAppConfigLive,
  createConfig,
} from "../config/appConfig";
import { createDbClientLive } from "../db/dbClient";
import { Effect, Layer } from "effect";
import { RolaServiceLive } from "../rola/rola";
import {
  CreateChallengeLive,
  createChallengeProgram,
} from "../challenge/createChallenge";
import { VerifyRolaProofLive } from "../rola/verifyRolaProof";
import {
  signInWithRolaProof,
  type SignInWithRolaProofInput,
} from "../programs/signInWithRolaProof";
import { GenerateSessionTokenLive } from "../session/generateSessionToken";
import { CreateSessionLive } from "../session/createSession";
import { VerifyChallengeLive } from "../challenge/verifyChallenge";
import { UpsertUserLive } from "../user/upsertUser";
import { validateSessionTokenProgram } from "../programs/validateSessionToken";
import { InvalidateSessionLive } from "../session/invalidateSession";
import {
  verifyAccountOwnershipProgram,
  type VerifyAccountOwnershipInput,
} from "../programs/verifyAccountOwnership";
import { UpsertAccountsLive } from "../account/upsertAccounts";
import { GetAccountsByAddressLive } from "../account/getAccountsByAddress";
import { GetSessionLive } from "../session/getSession";
import { CheckAccountPersistenceServiceLive } from "../../common/gateway/checkAccountPersistence";
import { GatewayApiClientLive } from "../../common/gateway/gatewayApiClient";
import { getAccountsProgram } from "../programs/getAccounts";
import { signOutProgram } from "../programs/signOutProgram";
import {
  GetActivitiesLive,
  GetActivitiesService,
} from "../activity/getActivities";
import { GetSeasonsLive, GetSeasonsService } from "../season/getSeasons";
import {
  GetSeasonByIdLive,
  GetSeasonByIdService,
} from "../season/getSeasonById";
import {
  GetActivityByIdLive,
  GetActivityByIdService,
} from "../activity/getActivityById";
import {
  GetActivityWeeksByWeekIdsLive,
  GetActivityWeeksByWeekIdsService,
} from "../activity-week/getActivityWeeksByWeekIds";
import {
  GetUsersPaginatedLive,
  GetUsersPaginatedService,
} from "../user/getUsersPaginated";
import {
  UpdateWeekStatusLive,
  UpdateWeekStatusService,
} from "../week/updateWeekStatus";
import { UserService } from "../user/user";
import { AccountBalanceService } from "../account/accountBalance";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSdk } from "@effect/opentelemetry";
import { SeasonService } from "../season/season";
import { WeekService } from "../week/week";
import { LeaderboardService } from "../leaderboard/leaderboard";

export type DependencyLayer = ReturnType<typeof createDependencyLayer>;

export type CreateDependencyLayerInput = {
  dbClient: Db;
  appConfig?: AppConfig;
};

export const createDependencyLayer = (input: CreateDependencyLayerInput) => {
  const dbClientLive = createDbClientLive(input.dbClient);

  const appConfig = createConfig(input.appConfig);
  const appConfigLive = createAppConfigLive(appConfig);

  const gatewayApiClientLive = GatewayApiClientLive;

  const checkAccountPersistenceLive = CheckAccountPersistenceServiceLive.pipe(
    Layer.provide(gatewayApiClientLive)
  );

  const rolaServiceLive = RolaServiceLive.pipe(Layer.provide(appConfigLive));

  const createChallengeLive = CreateChallengeLive.pipe(
    Layer.provide(dbClientLive)
  );

  const upsertUserLive = UpsertUserLive.pipe(Layer.provide(dbClientLive));

  const generateSessionTokenLive = GenerateSessionTokenLive;

  const verifyChallengeLive = VerifyChallengeLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(appConfigLive)
  );

  const createSessionLive = CreateSessionLive.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(appConfigLive)
  );

  const verifyRolaProofLive = VerifyRolaProofLive.pipe(
    Layer.provide(rolaServiceLive)
  );

  const invalidateSessionLive = InvalidateSessionLive.pipe(
    Layer.provide(dbClientLive)
  );

  const upsertAccountsLive = UpsertAccountsLive.pipe(
    Layer.provide(dbClientLive)
  );

  const getAccountsByAddressLive = GetAccountsByAddressLive.pipe(
    Layer.provide(dbClientLive)
  );

  const getSessionLive = GetSessionLive.pipe(Layer.provide(dbClientLive));

  const getActivitiesLive = GetActivitiesLive.pipe(Layer.provide(dbClientLive));

  const getSeasonsLive = GetSeasonsLive.pipe(Layer.provide(dbClientLive));

  const getSeasonByIdLive = GetSeasonByIdLive.pipe(Layer.provide(dbClientLive));

  const getActivityByIdLive = GetActivityByIdLive.pipe(
    Layer.provide(dbClientLive)
  );

  const getActivityWeeksByWeekIdsLive = GetActivityWeeksByWeekIdsLive.pipe(
    Layer.provide(dbClientLive)
  );

  const getUsersPaginatedLive = GetUsersPaginatedLive.pipe(
    Layer.provide(dbClientLive)
  );

  const updateWeekStatusLive = UpdateWeekStatusLive.pipe(
    Layer.provide(dbClientLive)
  );

  const NodeSdkLive = NodeSdk.layer(() => ({
    resource: { serviceName: "api" },
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: `${appConfig.otlpBaseUrl}/v1/traces`,
      })
    ),
  }));

  const createChallenge = () =>
    Effect.runPromiseExit(
      createChallengeProgram.pipe(Effect.provide(createChallengeLive))
    );

  const signIn = (input: SignInWithRolaProofInput) => {
    const program = Effect.provide(
      signInWithRolaProof(input),
      Layer.mergeAll(
        rolaServiceLive,
        appConfigLive,
        dbClientLive,
        verifyRolaProofLive,
        createSessionLive,
        generateSessionTokenLive,
        upsertUserLive,
        verifyChallengeLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const validateSessionToken = (sessionToken: string) => {
    const program = Effect.provide(
      validateSessionTokenProgram(sessionToken),
      Layer.mergeAll(
        getSessionLive,
        invalidateSessionLive,
        dbClientLive,
        appConfigLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const verifyAccountOwnership = (input: VerifyAccountOwnershipInput) => {
    const program = Effect.provide(
      verifyAccountOwnershipProgram(input),
      Layer.mergeAll(
        rolaServiceLive,
        appConfigLive,
        dbClientLive,
        verifyRolaProofLive,
        verifyChallengeLive,
        upsertAccountsLive,
        getAccountsByAddressLive,
        checkAccountPersistenceLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const getAccounts = (userId: string) => {
    const program = Effect.provide(
      getAccountsProgram(userId),
      Layer.mergeAll(dbClientLive)
    );

    return Effect.runPromiseExit(program);
  };

  const signOut = (userId: string) => {
    const program = Effect.provide(
      signOutProgram(userId),
      Layer.mergeAll(dbClientLive)
    );

    return Effect.runPromiseExit(program);
  };

  const getActivities = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getActivitiesService = yield* GetActivitiesService;
        return yield* getActivitiesService();
      }),
      Layer.mergeAll(dbClientLive, getActivitiesLive)
    );

    return Effect.runPromiseExit(program);
  };

  const getActivityById = (input: { id: string }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getActivityByIdService = yield* GetActivityByIdService;
        return yield* getActivityByIdService(input);
      }),
      Layer.mergeAll(dbClientLive, getActivityByIdLive)
    );

    return Effect.runPromiseExit(program);
  };

  const getSeasons = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getSeasonsService = yield* GetSeasonsService;
        return yield* getSeasonsService();
      }),
      Layer.mergeAll(dbClientLive, getSeasonsLive)
    );

    return Effect.runPromiseExit(program);
  };

  const getSeasonById = (input: { id: string; includeWeeks?: boolean }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getSeasonByIdService = yield* GetSeasonByIdService;
        const { weeks, ...season } = yield* getSeasonByIdService(input);
        const getActivityWeeksService = yield* GetActivityWeeksByWeekIdsService;

        const activityWeeks = yield* getActivityWeeksService({
          ids: weeks?.map((week) => week.id) ?? [],
        });

        return { season, weeks, activityWeeks };
      }),
      Layer.mergeAll(
        dbClientLive,
        getSeasonByIdLive,
        getActivityWeeksByWeekIdsLive
      )
    );

    return Effect.runPromiseExit(program);
  };

  const getActivityWeeksByWeekIds = (input: { ids: string[] }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getActivityWeeksByWeekIdsService =
          yield* GetActivityWeeksByWeekIdsService;
        return yield* getActivityWeeksByWeekIdsService(input);
      }),
      Layer.mergeAll(dbClientLive, getActivityWeeksByWeekIdsLive)
    );

    return Effect.runPromiseExit(program);
  };

  const getUsersPaginated = (input: { page: number; limit: number }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getUsersPaginatedService = yield* GetUsersPaginatedService;
        return yield* getUsersPaginatedService(input);
      }),
      Layer.mergeAll(dbClientLive, getUsersPaginatedLive)
    );

    return Effect.runPromiseExit(program);
  };

  const updateWeekStatus = (input: { id: string; status: Week["status"] }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const updateWeekStatusService = yield* UpdateWeekStatusService;
        return yield* updateWeekStatusService(input);
      }),
      Layer.mergeAll(dbClientLive, updateWeekStatusLive)
    );

    return Effect.runPromiseExit(program);
  };

  const seasonLive = SeasonService.Default.pipe(Layer.provide(dbClientLive));

  const weekLive = WeekService.Default.pipe(Layer.provide(dbClientLive));

  const userLive = UserService.Default.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(seasonLive)
  );

  const getUserStats = (input: { userId: string }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const userStatsService = yield* UserService;
        const weekService = yield* WeekService;

        const activeWeek = yield* weekService.getActiveWeek();

        return yield* userStatsService.getUserStats({
          ...input,
          weekId: activeWeek.id,
          seasonId: activeWeek.seasonId,
        });
      }),
      Layer.mergeAll(userLive, weekLive)
    ).pipe(Effect.provide(NodeSdkLive));

    return Effect.runPromiseExit(program);
  };

  const getLatestAccountBalancesServiceLive =
    AccountBalanceService.Default.pipe(Layer.provide(dbClientLive));

  const leaderboardLive = LeaderboardService.Default.pipe(
    Layer.provide(dbClientLive)
  );

  const getLatestAccountBalances = ({ userId }: { userId: string }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const userService = yield* UserService;
        const accountBalanceService = yield* AccountBalanceService;

        const accounts = yield* userService.getAccountsByUserId({
          userId,
        });

        const accountAddresses = accounts.map((account) => account.address);

        if (accountAddresses.length === 0) {
          return [];
        }

        return yield* accountBalanceService.getLatest(accountAddresses);
      }),
      Layer.mergeAll(getLatestAccountBalancesServiceLive, userLive)
    );

    return Effect.runPromiseExit(program);
  };

  const getSeasonLeaderboard = (input: {
    seasonId: string;
    userId?: string;
  }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const leaderboardService = yield* LeaderboardService;
        return yield* leaderboardService.getSeasonLeaderboard(input);
      }),
      leaderboardLive
    );

    return Effect.runPromiseExit(program);
  };

  const getActivityLeaderboard = (input: {
    activityId: string;
    weekId: string;
    userId?: string;
  }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const leaderboardService = yield* LeaderboardService;
        return yield* leaderboardService.getActivityLeaderboard(input);
      }),
      leaderboardLive
    );

    return Effect.runPromiseExit(program);
  };

  const getAvailableSeasons = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const leaderboardService = yield* LeaderboardService;
        return yield* leaderboardService.getAvailableSeasons();
      }),
      leaderboardLive
    );

    return Effect.runPromiseExit(program);
  };

  const getAvailableWeeks = (input: { seasonId?: string }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const leaderboardService = yield* LeaderboardService;
        return yield* leaderboardService.getAvailableWeeks(input);
      }),
      leaderboardLive
    );

    return Effect.runPromiseExit(program);
  };

  const getAvailableActivities = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const leaderboardService = yield* LeaderboardService;
        return yield* leaderboardService.getAvailableActivities();
      }),
      leaderboardLive
    );

    return Effect.runPromiseExit(program);
  };

  return {
    createChallenge,
    signIn,
    validateSessionToken,
    verifyAccountOwnership,
    getAccounts,
    signOut,
    getActivities,
    getActivityById,
    getSeasons,
    getSeasonById,
    getActivityWeeksByWeekIds,
    getUsersPaginated,
    updateWeekStatus,
    getUserStats,
    getLatestAccountBalances,
    getSeasonLeaderboard,
    getActivityLeaderboard,
    getAvailableSeasons,
    getAvailableWeeks,
    getAvailableActivities,
  };
};

import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { type Db, db, type Season } from 'db/incentives';
import { Effect, Layer } from 'effect';
import { groupBy } from 'effect/Array';
import {
  type GetLedgerStateInput,
  GetLedgerStateService,
} from '../../common/gateway';

import { GatewayApiClientLive } from '../../common/gateway/gatewayApiClient';
import { GetEntitiesByRoleRequirementService } from '../../common/gateway/getEntitiesByRoleRequirement';
import { GetEntityRoleAssignmentsService } from '../../common/gateway/getEntityRoleAssignments';
import { AccountBalanceService } from '../account/accountBalance';

import {
  ActivityService,
  type UpdateActivityInput,
} from '../activity/activity';
import { ActivityDataService } from '../activity/activityData';
import {
  GetActivitiesLive,
  GetActivitiesService,
} from '../activity/getActivities';
import {
  GetActivityByIdLive,
  GetActivityByIdService,
} from '../activity/getActivityById';
import {
  ActivityCategoryService,
  type UpdateActivityCategory,
} from '../activity-category/activityCategory';
import { EarnPageService } from '../activity-category/earnPageService';
import { ActivityCategoryWeekService } from '../activity-category-week/activityCategoryWeek';
import {
  type CalculateTWASQLInput,
  CalculateTWASQLService,
} from '../activity-points';
import { ActivityWeekService } from '../activity-week/activityWeek';
import {
  GetActivityWeeksByWeekIdsLive,
  GetActivityWeeksByWeekIdsService,
} from '../activity-week/getActivityWeeksByWeekIds';
import {
  type SignInWithRolaProofInput,
  SignInWithRolaProofService,
} from '../auth/signInWithRolaProof';
import { SignOutService } from '../auth/signOut';
import {
  type VerifyAccountOwnershipInput,
  VerifyAccountOwnershipService,
} from '../auth/verifyAccountOwnership';
import { CreateChallengeService } from '../challenge/createChallenge';
import { VerifyChallengeService } from '../challenge/verifyChallenge';
import { ComponentWhitelistService } from '../component/componentWhitelist';
import { parseCsvWhitelist } from '../component/parseCsvWhitelist';
import {
  type AppConfig,
  createAppConfigLive,
  createConfig,
} from '../config/appConfig';
import { ConfigService } from '../config/configService';
import {
  NotificationService,
  type NotificationSettings,
} from '../config/notificationService';
import { DappService } from '../dapp/dapp';
import { createDbClientLive } from '../db/dbClient';
import { ActivityDisplayService } from '../leaderboard/activityDisplay';
import { ActivityPointsAdjustmentService } from '../leaderboard/activityPointsAdjustment';
import { LeaderboardService } from '../leaderboard/leaderboard';
import { getAccountsProgram } from '../programs/getAccounts';
import { validateSessionTokenProgram } from '../programs/validateSessionToken';
import {
  GetSeasonByIdLive,
  GetSeasonByIdService,
} from '../season/getSeasonById';
import { GetSeasonsLive, GetSeasonsService } from '../season/getSeasons';
import { type EditSeasonInput, SeasonService } from '../season/season';
import {
  type CalculateSeasonPointsInput,
  CalculateSeasonPointsService,
} from '../season-points/calculateSeasonPoints';
import { SeedUserReferralCodesService } from '../seed/seedUserReferralCodes';
import { GetSessionLive } from '../session/getSession';
import { InvalidateSessionLive } from '../session/invalidateSession';
import { MarginAccountDbService } from '../surge/marginAccountDbService';
import { MarginAccountSeedingService } from '../surge/marginAccountSeedingService';
import { parseCsvMarginAccounts } from '../surge/parseCsvMarginAccounts';
import { UpdateMarginAccountOwnerService } from '../surge/updateMarginAccountOwner';
import {
  type SetStateInput,
  type SetStateVersionInput,
  TransactionStreamApiService,
} from '../transaction-stream/transactionStreamApi';
import {
  GetUsersPaginatedLive,
  GetUsersPaginatedService,
} from '../user/getUsersPaginated';
import { UserService } from '../user/user';
import { UserReferral } from '../user-referral/userReferral';
import { UpdateWeekStatusService } from '../week/updateWeekStatus';
import { type CreateWeekInput, WeekService } from '../week/week';
import {
  type SeasonPointsMultiplierJob,
  type SnapshotDateRangeJob,
  WorkerApiService,
} from '../worker/workerApi';

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

  const invalidateSessionLive = InvalidateSessionLive.pipe(
    Layer.provide(dbClientLive),
  );

  const getSessionLive = GetSessionLive.pipe(Layer.provide(dbClientLive));

  const getActivitiesLive = GetActivitiesLive.pipe(Layer.provide(dbClientLive));

  const getSeasonsLive = GetSeasonsLive.pipe(Layer.provide(dbClientLive));

  const getSeasonByIdLive = GetSeasonByIdLive.pipe(Layer.provide(dbClientLive));

  const getActivityByIdLive = GetActivityByIdLive.pipe(
    Layer.provide(dbClientLive),
  );

  const getActivityWeeksByWeekIdsLive = GetActivityWeeksByWeekIdsLive.pipe(
    Layer.provide(dbClientLive),
  );

  const getUsersPaginatedLive = GetUsersPaginatedLive.pipe(
    Layer.provide(dbClientLive),
  );

  const updateWeekStatusLive = UpdateWeekStatusService.Default;

  const NodeSdkLive = NodeSdk.layer(() => ({
    resource: { serviceName: 'api' },
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: `${appConfig.otlpBaseUrl}/v1/traces`,
      }),
    ),
  }));

  const createChallenge = () => {
    const runnable = Effect.gen(function* () {
      const createChallenge = yield* CreateChallengeService;
      return yield* createChallenge();
    }).pipe(Effect.provide(CreateChallengeService.Default));

    return Effect.runPromiseExit(runnable);
  };

  const signIn = (input: SignInWithRolaProofInput) => {
    const runnable = Effect.gen(function* () {
      const signInWithRolaProof = yield* SignInWithRolaProofService;
      return yield* signInWithRolaProof(input);
    }).pipe(Effect.provide(SignInWithRolaProofService.Default));

    return Effect.runPromiseExit(runnable);
  };

  const validateSessionToken = (sessionToken: string) => {
    const program = Effect.provide(
      validateSessionTokenProgram(sessionToken),
      Layer.mergeAll(
        getSessionLive,
        invalidateSessionLive,
        dbClientLive,
        appConfigLive,
      ),
    );

    return Effect.runPromiseExit(program);
  };

  const verifyAccountOwnership = (input: VerifyAccountOwnershipInput) => {
    const runnable = Effect.gen(function* () {
      const verifyAccountOwnership = yield* VerifyAccountOwnershipService;
      return yield* verifyAccountOwnership(input);
    }).pipe(
      Effect.provide(VerifyAccountOwnershipService.Default),
      Effect.provide(VerifyChallengeService.Default),
    );

    return Effect.runPromiseExit(runnable);
  };

  const getAccounts = (userId: string) => {
    const program = Effect.provide(
      getAccountsProgram(userId),
      Layer.mergeAll(dbClientLive),
    );

    return Effect.runPromiseExit(program);
  };

  const signOut = (userId: string) => {
    const runnable = Effect.gen(function* () {
      const signOutService = yield* SignOutService;
      return yield* signOutService(userId);
    }).pipe(Effect.provide(SignOutService.Default));

    return Effect.runPromiseExit(runnable);
  };

  const getActivities = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getActivitiesService = yield* GetActivitiesService;
        return yield* getActivitiesService();
      }),
      Layer.mergeAll(dbClientLive, getActivitiesLive),
    );

    return Effect.runPromiseExit(program);
  };

  const getActivityById = (input: { id: string }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getActivityByIdService = yield* GetActivityByIdService;
        return yield* getActivityByIdService(input);
      }),
      Layer.mergeAll(dbClientLive, getActivityByIdLive),
    );

    return Effect.runPromiseExit(program);
  };

  const getSeasons = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getSeasonsService = yield* GetSeasonsService;
        return yield* getSeasonsService();
      }),
      Layer.mergeAll(dbClientLive, getSeasonsLive),
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
        getActivityWeeksByWeekIdsLive,
        ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive)),
      ),
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
      Layer.mergeAll(dbClientLive, getActivityWeeksByWeekIdsLive),
    );

    return Effect.runPromiseExit(program);
  };

  const getUsersPaginated = (input: { page: number; limit: number }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getUsersPaginatedService = yield* GetUsersPaginatedService;
        return yield* getUsersPaginatedService(input);
      }),
      Layer.mergeAll(dbClientLive, getUsersPaginatedLive),
    );

    return Effect.runPromiseExit(program);
  };

  const updateWeekStatus = (input: { id: string; processed: boolean }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const updateWeekStatusService = yield* UpdateWeekStatusService;
        return yield* updateWeekStatusService.run(input);
      }),
      Layer.mergeAll(dbClientLive, updateWeekStatusLive),
    );

    return Effect.runPromiseExit(program);
  };

  const seasonLive = SeasonService.Default.pipe(Layer.provide(dbClientLive));

  const activityWeekServiceLive = ActivityWeekService.Default.pipe(
    Layer.provide(dbClientLive),
  );

  const activityCategoryWeekServiceLive =
    ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive));

  const activityCategoryServiceLive = ActivityCategoryService.Default.pipe(
    Layer.provide(dbClientLive),
  );

  const dappServiceLive = DappService.Default;

  const weekLive = WeekService.Default.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(activityCategoryWeekServiceLive),
    Layer.provide(activityWeekServiceLive),
  );

  const earnPageServiceLive = EarnPageService.Default.pipe(
    Layer.provide(dbClientLive),
  );

  const getLatestAccountBalancesServiceLive =
    AccountBalanceService.Default.pipe(Layer.provide(dbClientLive));

  const activityServiceLive = ActivityService.Default.pipe(
    Layer.provide(dbClientLive),
  );

  const userLive = UserService.Default.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(seasonLive),
    Layer.provide(getLatestAccountBalancesServiceLive),
    Layer.provide(activityServiceLive),
    Layer.provide(activityWeekServiceLive),
  );

  const getUserStats = (input: { userId: string; weekId: string }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const userStatsService = yield* UserService;
        const weekService = yield* WeekService;

        const activeWeek = yield* weekService.getById(input.weekId);

        return yield* userStatsService.getUserStats({
          ...input,
          weekId: activeWeek.id,
          seasonId: activeWeek.seasonId,
        });
      }),
      Layer.mergeAll(userLive, weekLive),
    ).pipe(Effect.provide(NodeSdkLive));

    return Effect.runPromiseExit(program);
  };

  const getMultiplierByUserId = (input: { userId: string; weekId: string }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const userService = yield* UserService;
        return yield* userService.getMultiplierByUserId(input);
      }),
      userLive,
    );

    return Effect.runPromiseExit(program);
  };

  const activityDisplayServiceLive = ActivityDisplayService.Default;

  const activityPointsAdjustmentServiceLive =
    ActivityPointsAdjustmentService.Default;

  const leaderboardLive = LeaderboardService.Default.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(weekLive),
    Layer.provide(seasonLive),
    Layer.provide(activityCategoryServiceLive),
    Layer.provide(activityCategoryWeekServiceLive),
    Layer.provide(activityWeekServiceLive),
    Layer.provide(activityDisplayServiceLive),
    Layer.provide(activityPointsAdjustmentServiceLive),
    Layer.provide(userLive),
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
      Layer.mergeAll(getLatestAccountBalancesServiceLive, userLive),
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
      leaderboardLive,
    );

    return Effect.runPromiseExit(program);
  };

  const getAvailableSeasons = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const leaderboardService = yield* LeaderboardService;
        return yield* leaderboardService.getAvailableSeasons();
      }),
      leaderboardLive,
    );

    return Effect.runPromiseExit(program);
  };

  const getAvailableWeeks = (input: { seasonId?: string }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const leaderboardService = yield* LeaderboardService;
        return yield* leaderboardService.getAvailableWeeks(input);
      }),
      leaderboardLive,
    );

    return Effect.runPromiseExit(program);
  };

  const getActivityCategoryLeaderboard = (input: {
    categoryId: string;
    weekId: string;
    userId?: string;
  }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const leaderboardService = yield* LeaderboardService;
        return yield* leaderboardService.getActivityCategoryLeaderboard(input);
      }),
      leaderboardLive,
    );

    return Effect.runPromiseExit(program);
  };

  const getAvailableCategories = (input: { weekId: string }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const leaderboardService = yield* LeaderboardService;
        return yield* leaderboardService.getAvailableCategories(input);
      }),
      leaderboardLive,
    );

    return Effect.runPromiseExit(program);
  };

  const getUserCategoryBreakdown = (input: {
    weekId: string;
    userId: string;
  }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const userService = yield* UserService;
        return yield* userService.getUserCategoryBreakdown(input);
      }),
      userLive,
    );

    return Effect.runPromiseExit(program);
  };

  const getUserCapitalAtWork = (input: { weekId: string; userId?: string }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const userService = yield* UserService;
        return yield* userService.getUserCapitalAtWork(input);
      }),
      userLive,
    );

    return Effect.runPromiseExit(program);
  };

  const getActivityData = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const activityDataService = yield* ActivityDataService;
        return yield* activityDataService.list();
      }),
      ActivityDataService.Default.pipe(Layer.provide(dbClientLive)),
    );

    return Effect.runPromiseExit(program);
  };

  const updateActivity = (input: UpdateActivityInput) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const activityService = yield* ActivityService;
        yield* activityService.update(input);
      }),
      activityServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const getDapps = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const dappService = yield* DappService;
        return yield* dappService.list();
      }),
      dappServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const componentWhitelistServiceLive = ComponentWhitelistService.Default.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(appConfigLive),
  );

  const marginAccountDbServiceLive = MarginAccountDbService.Default.pipe(
    Layer.provide(dbClientLive),
  );

  const getEntityRoleAssignmentsLive =
    GetEntityRoleAssignmentsService.Default.pipe(
      Layer.provide(gatewayApiClientLive),
    );

  const getEntitiesByRoleRequirementLive =
    GetEntitiesByRoleRequirementService.Default.pipe(
      Layer.provide(gatewayApiClientLive),
    );

  const getLedgerStateLive = GetLedgerStateService.Default.pipe(
    Layer.provide(gatewayApiClientLive),
  );

  const configServiceLive = ConfigService.Default.pipe(
    Layer.provide(dbClientLive),
    Layer.provide(getLedgerStateLive),
  );

  const updateMarginAccountOwnerLive =
    UpdateMarginAccountOwnerService.Default.pipe(
      Layer.provide(getEntityRoleAssignmentsLive),
      Layer.provide(getEntitiesByRoleRequirementLive),
    );

  const marginAccountSeedingServiceLive =
    MarginAccountSeedingService.Default.pipe(
      Layer.provide(marginAccountDbServiceLive),
      Layer.provide(updateMarginAccountOwnerLive),
      Layer.provide(configServiceLive),
    );

  const getActivityCategories = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const activityCategoryService = yield* ActivityCategoryService;
        return yield* activityCategoryService.list();
      }),
      activityCategoryServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const updateActivityCategory = (
    id: string,
    updates: UpdateActivityCategory,
  ) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const activityCategoryService = yield* ActivityCategoryService;
        return yield* activityCategoryService.update(id, updates);
      }),
      activityCategoryServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const getActivityCategoriesForEarnPage = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const activityCategoryService = yield* ActivityCategoryService;
        return yield* activityCategoryService.listForEarnPage();
      }),
      activityCategoryServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const getEarnPageData = (weekId: string) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const earnPageService = yield* EarnPageService;
        return yield* earnPageService.getData(weekId);
      }),
      earnPageServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const getWeekDetailsLive = Layer.mergeAll(
    ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive)),
    weekLive,
    ActivityCategoryService.Default.pipe(Layer.provide(dbClientLive)),
    ActivityService.Default.pipe(Layer.provide(dbClientLive)),
  );

  const getWeekDetails = (input: { weekId: string }) => {
    const runnable = Effect.gen(function* () {
      const activityCategoryWeekService = yield* ActivityCategoryWeekService;
      const activityCategoryService = yield* ActivityCategoryService;
      const weekService = yield* WeekService;
      const activityService = yield* ActivityService;

      const [categoryWeeks, week, activityCategories, activities] =
        yield* Effect.all([
          activityCategoryWeekService.getByWeekId({ weekId: input.weekId }),
          weekService.getById(input.weekId),
          activityCategoryService.list(),
          activityService.list(),
        ]);

      const output = {
        ...week,
        activityCategories: categoryWeeks,
        allActivityCategories: activityCategories,
        allActivities: activities,
      };

      return output;
    });

    return Effect.runPromiseExit(Effect.provide(runnable, getWeekDetailsLive));
  };

  const updateCategoryWeekPointsPool = (input: {
    weekId: string;
    activityCategoryId: string;
    pointsPool: number;
  }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const activityCategoryWeekService = yield* ActivityCategoryWeekService;
        yield* activityCategoryWeekService.updatePointsPool(input);
      }),
      activityCategoryWeekServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const updateActivityWeekMultiplier = (input: {
    weekId: string;
    activityId: string;
    multiplier: number;
  }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const activityWeekService = yield* ActivityWeekService;
        yield* activityWeekService.updateMultiplier(input);
      }),
      ActivityWeekService.Default.pipe(Layer.provide(dbClientLive)),
    );
    return Effect.runPromiseExit(program);
  };

  const updateCategoryWeekLowerBoundsPercentage = (input: {
    weekId: string;
    activityCategoryId: string;
    lowerBoundsPercentage: string;
  }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const activityCategoryWeekService = yield* ActivityCategoryWeekService;
        yield* activityCategoryWeekService.updateLowerBoundsPercentage(input);
      }),
      ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive)),
    );
    return Effect.runPromiseExit(program);
  };

  const updateCategoryWeekOutlierThresholdPercentage = (input: {
    weekId: string;
    activityCategoryId: string;
    outlierThresholdPercentage: string;
  }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const activityCategoryWeekService = yield* ActivityCategoryWeekService;
        yield* activityCategoryWeekService.updateOutlierThresholdPercentage(
          input,
        );
      }),
      ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive)),
    );
    return Effect.runPromiseExit(program);
  };

  const updateCategoryWeekEnableOutlierDetection = (input: {
    weekId: string;
    activityCategoryId: string;
    enableOutlierDetection: boolean;
  }) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const activityCategoryWeekService = yield* ActivityCategoryWeekService;
        yield* activityCategoryWeekService.updateEnableOutlierDetection(input);
      }),
      ActivityCategoryWeekService.Default.pipe(Layer.provide(dbClientLive)),
    );
    return Effect.runPromiseExit(program);
  };

  const createSeason = (input: Omit<Season, 'id'>) => {
    const runnable = Effect.gen(function* () {
      const seasonService = yield* SeasonService;
      return yield* seasonService.create(input);
    });

    const program = Effect.provide(
      runnable,
      Layer.mergeAll(SeasonService.Default.pipe(Layer.provide(dbClientLive))),
    );

    return Effect.runPromiseExit(program);
  };

  const editSeason = (input: EditSeasonInput) => {
    const runnable = Effect.gen(function* () {
      const seasonService = yield* SeasonService;
      return yield* seasonService.edit(input);
    });

    const program = Effect.provide(
      runnable,
      Layer.mergeAll(SeasonService.Default.pipe(Layer.provide(dbClientLive))),
    );

    return Effect.runPromiseExit(program);
  };

  const createWeek = (input: CreateWeekInput) => {
    const runnable = Effect.gen(function* () {
      const weekService = yield* WeekService;
      return yield* weekService.create(input);
    });

    const program = Effect.provide(runnable, weekLive);

    return Effect.runPromiseExit(program);
  };

  const getComponentWhitelistCount = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const service = yield* ComponentWhitelistService;
        return yield* service.getCount();
      }),
      componentWhitelistServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const uploadComponentWhitelistCsv = (csvData: string) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        // Parse CSV first
        const parseResult = yield* parseCsvWhitelist({ csvData });

        // Upload to database
        const service = yield* ComponentWhitelistService;
        yield* service.uploadCsv(parseResult.componentAddresses);

        return {
          success: true,
          count: parseResult.count,
          message:
            parseResult.count === 0
              ? 'Successfully cleared component whitelist'
              : `Successfully updated whitelist with ${parseResult.count} components`,
        };
      }),
      componentWhitelistServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const getMarginAccountCount = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const service = yield* MarginAccountDbService;
        return yield* service.getCount();
      }),
      marginAccountDbServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const uploadMarginAccountSeedingCsv = (csvData: string) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        // Parse CSV first
        const parseResult = yield* parseCsvMarginAccounts({ csvData });

        // Seed margin accounts
        const service = yield* MarginAccountSeedingService;
        const result = yield* service.seedMarginAccounts({
          marginAccountAddresses: parseResult.marginAccountAddresses,
        });

        return {
          success: true,
          processed: result.processed,
          inserted: result.inserted,
          updated: result.updated,
          skipped: result.skipped,
          errors: result.errors,
          message:
            result.errors.length > 0
              ? `Processed ${result.processed} margin accounts. ${result.inserted} inserted, ${result.updated} updated, ${result.skipped} skipped, ${result.errors.length} errors.`
              : `Successfully processed ${result.processed} margin accounts. ${result.inserted} inserted, ${result.updated} updated, ${result.skipped} skipped.`,
        };
      }),
      marginAccountSeedingServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const notificationServiceLive = NotificationService.Default.pipe(
    Layer.provide(dbClientLive),
  );

  const getNotificationSettings = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const notificationService = yield* NotificationService;
        return yield* notificationService.getNotificationSettings();
      }),
      notificationServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const updateNotificationSettings = (settings: NotificationSettings) => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const notificationService = yield* NotificationService;
        return yield* notificationService.updateNotificationSettings(settings);
      }),
      notificationServiceLive,
    );
    return Effect.runPromiseExit(program);
  };

  const calculateTWASQL = (input: CalculateTWASQLInput) => {
    const program = Effect.gen(function* () {
      const calculateTWASQLService = yield* CalculateTWASQLService;
      return yield* calculateTWASQLService(input);
    }).pipe(Effect.provide(CalculateTWASQLService.Default));

    return Effect.runPromiseExit(program);
  };

  const getTransactionStreamState = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const configService = yield* Effect.provide(
          ConfigService,
          configServiceLive,
        );
        return yield* configService.getTransactionStreamState();
      }),
      configServiceLive,
    );

    return Effect.runPromiseExit(program);
  };

  const getTransactionStreamStateVersion = () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const configService = yield* Effect.provide(
          ConfigService,
          configServiceLive,
        );
        const getLedgerStateService = yield* Effect.provide(
          GetLedgerStateService,
          getLedgerStateLive,
        );
        const stateVersion = yield* configService.getStateVersion();
        if (!stateVersion) {
          return undefined;
        }
        const ledgerState = yield* getLedgerStateService({
          at_ledger_state: {
            state_version: stateVersion,
          },
        });
        return {
          stateVersion: ledgerState.state_version,
          timestamp: ledgerState.proposer_round_timestamp,
        };
      }),
      configServiceLive,
    );

    return Effect.runPromiseExit(program);
  };

  const getLedgerState = (input: GetLedgerStateInput) => {
    const program = Effect.gen(function* () {
      const getLedgerStateService = yield* Effect.provide(
        GetLedgerStateService,
        getLedgerStateLive,
      );
      return yield* getLedgerStateService(input);
    });
    return Effect.runPromiseExit(program);
  };

  const setStateVersion = (input: SetStateVersionInput) => {
    const program = Effect.gen(function* () {
      const transactionStreamApiService = yield* TransactionStreamApiService;
      return yield* transactionStreamApiService.setStateVersion(input);
    }).pipe(Effect.provide(TransactionStreamApiService.Default));
    return Effect.runPromiseExit(program);
  };

  const setState = (input: SetStateInput) => {
    const program = Effect.gen(function* () {
      const transactionStreamApiService = yield* TransactionStreamApiService;
      return yield* transactionStreamApiService.setState(input);
    }).pipe(Effect.provide(TransactionStreamApiService.Default));
    return Effect.runPromiseExit(program);
  };

  const calculateSeasonPoints = (input: CalculateSeasonPointsInput) => {
    const program = Effect.gen(function* () {
      const calculateSeasonPointsService = yield* CalculateSeasonPointsService;
      return yield* calculateSeasonPointsService.run(input);
    }).pipe(Effect.provide(CalculateSeasonPointsService.Default));

    return Effect.runPromiseExit(program);
  };

  const getQueues = () => {
    const program = Effect.gen(function* () {
      const workerApiService = yield* WorkerApiService;
      return yield* workerApiService.getQueues();
    }).pipe(Effect.provide(WorkerApiService.Default));

    return Effect.runPromiseExit(program);
  };

  const addDateRangeJob = (input: SnapshotDateRangeJob) => {
    const program = Effect.gen(function* () {
      const workerApiService = yield* WorkerApiService;
      return yield* workerApiService.addDateRangeJob(input);
    }).pipe(Effect.provide(WorkerApiService.Default));

    return Effect.runPromiseExit(program);
  };

  const addSeasonPointsMultiplierJob = (input: SeasonPointsMultiplierJob) => {
    const program = Effect.gen(function* () {
      const workerApiService = yield* WorkerApiService;
      return yield* workerApiService.addSeasonPointsMultiplierJob(input);
    }).pipe(Effect.provide(WorkerApiService.Default));

    return Effect.runPromiseExit(program);
  };

  const getActivityCategoryLeaderboardPaginated = (input: {
    categoryId: string;
    weekId: string;
    page?: number;
    limit?: number;
  }) => {
    const program = Effect.gen(function* () {
      const leaderboardService = yield* LeaderboardService;
      return yield* leaderboardService.getActivityCategoryLeaderboardPaginated(
        input,
      );
    }).pipe(Effect.provide(leaderboardLive));

    return Effect.runPromiseExit(program);
  };

  const getSeasonLeaderboardPaginated = (input: {
    seasonId: string;
    page?: number;
    limit?: number;
  }) => {
    const program = Effect.gen(function* () {
      const leaderboardService = yield* LeaderboardService;
      return yield* leaderboardService.getSeasonLeaderboardPaginated(input);
    }).pipe(Effect.provide(leaderboardLive));

    return Effect.runPromiseExit(program);
  };

  const getIncentivesData = () => {
    const program = Effect.gen(function* () {
      const seasonsResult = yield* Effect.tryPromise(() =>
        db.query.seasons.findMany({
          with: {
            weeks: {
              columns: {
                id: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        }),
      );

      const activityCategoriesResult = yield* Effect.tryPromise(() =>
        db.query.activities.findMany({
          with: {
            activityCategories: true,
          },
        }),
      ).pipe(
        Effect.map((items) => {
          const grouped = groupBy(items, (item) => item.activityCategories.id);
          return Object.values(grouped).map((activities) => ({
            id: activities[0].activityCategories.id,
            name: activities[0].activityCategories.name,
            description: activities[0].activityCategories.description,
            activities: activities.map(
              ({ data, activityCategories, ...activity }) => activity,
            ),
          }));
        }),
      );

      const dAppsResult = yield* Effect.tryPromise(() =>
        db.query.dapps.findMany({}),
      );

      return {
        seasons: seasonsResult,
        dApps: dAppsResult,
        activityCategories: activityCategoriesResult,
      };
    });

    return Effect.runPromiseExit(program);
  };

  const seedActivities = () => {
    const program = Effect.gen(function* () {
      const activityCategoryWeekService = yield* ActivityCategoryWeekService;
      return yield* activityCategoryWeekService.seedActivities();
    }).pipe(Effect.provide(activityCategoryWeekServiceLive));
    return Effect.runPromiseExit(program);
  };

  const seedUserReferralCodes = () => {
    const program = Effect.gen(function* () {
      const service = yield* SeedUserReferralCodesService;
      return yield* service();
    }).pipe(Effect.provide(SeedUserReferralCodesService.Default));
    return Effect.runPromiseExit(program);
  };

  const getUserReferralStats = (input: {
    userId: string;
    seasonId: string;
  }) => {
    const program = Effect.gen(function* () {
      const service = yield* UserReferral;
      return yield* service.getUserReferralStats(input);
    }).pipe(Effect.provide(UserReferral.Default));

    return Effect.runPromiseExit(program);
  };

  const getUserByIdentityAddress = (input: { identityAddress: string }) => {
    const program = Effect.gen(function* () {
      const service = yield* UserService;
      return yield* service.getUserByIdentityAddress(input);
    }).pipe(Effect.provide(userLive));
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
    getMultiplierByUserId,
    getLatestAccountBalances,
    getSeasonLeaderboard,
    getActivityCategoryLeaderboard,
    getUserCategoryBreakdown,
    getUserCapitalAtWork,
    getAvailableSeasons,
    getAvailableWeeks,
    getAvailableCategories,
    getActivityData,
    updateActivity,
    getDapps,
    getActivityCategories,
    updateActivityCategory,
    getActivityCategoriesForEarnPage,
    getEarnPageData,
    getWeekDetails,
    updateCategoryWeekPointsPool,
    updateActivityWeekMultiplier,
    createSeason,
    editSeason,
    createWeek,
    getComponentWhitelistCount,
    uploadComponentWhitelistCsv,
    getMarginAccountCount,
    uploadMarginAccountSeedingCsv,
    getNotificationSettings,
    updateNotificationSettings,
    calculateTWASQL,
    getTransactionStreamState,
    getTransactionStreamStateVersion,
    getLedgerState,
    setStateVersion,
    setState,
    calculateSeasonPoints,
    getQueues,
    addDateRangeJob,
    addSeasonPointsMultiplierJob,
    getActivityCategoryLeaderboardPaginated,
    getSeasonLeaderboardPaginated,
    getIncentivesData,
    seedActivities,
    seedUserReferralCodes,
    updateCategoryWeekLowerBoundsPercentage,
    updateCategoryWeekOutlierThresholdPercentage,
    updateCategoryWeekEnableOutlierDetection,
    getUserReferralStats,
    getUserByIdentityAddress,
  };
};

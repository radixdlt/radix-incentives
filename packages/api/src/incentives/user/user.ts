import { BigNumber } from 'bignumber.js';
import {
  accountActivityPoints,
  accounts,
  activities,
  activityCategories,
  categoryLeaderboardCache,
  seasonPointsMultiplier,
  userSeasonPoints,
  users,
} from 'db/incentives';
import { and, count, eq, sql, sum } from 'drizzle-orm';
import { Data, Effect } from 'effect';
import { z } from 'zod';
import { AccountBalanceService } from '../account/accountBalance';
import { ActivityService } from '../activity/activity';
import { ActivityWeekService } from '../activity-week/activityWeek';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

class UserNotFoundError extends Data.TaggedError('UserNotFoundError')<{
  identityAddress?: string;
}> {}

class UserHasNoAccountsError extends Data.TaggedError(
  'UserHasNoAccountsError',
)<{
  message: string;
}> {}

type AnonymousUserData = {
  categoryId: string;
  capitalAtWork: string;
  earnedAP: string;
  apPerHour: string | null;
  activities: {
    activityId: string;
    activityName: string | null | undefined;
    capitalAtWork: string;
    earnedAP: string;
    apPerHour: string | null;
    dapp: {
      id: string;
      name: string;
      website: string;
    } | null;
    tokens: Array<{ name: string; resourceAddress: string }> | null;
    metadataUrl: string | null;
  }[];
}[];

export const UserEmailInputSchema = z.object({
  userId: z.string(),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export type UserEmailInput = z.infer<typeof UserEmailInputSchema>;

export class UserService extends Effect.Service<UserService>()('UserService', {
  dependencies: [
    dbClientLive,
    AccountBalanceService.Default,
    ActivityWeekService.Default,
    ActivityService.Default,
  ],
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;
    const accountBalanceService = yield* AccountBalanceService;
    const activityWeekService = yield* ActivityWeekService;
    const activityService = yield* ActivityService;

    // Pre-computed mappings for efficiency
    const activityToCategoryMap =
      yield* activityService.getActivityToCategoryMap();

    const getMultiplierByUserId = Effect.fn(function* (input: {
      userId: string;
      weekId: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db.query.seasonPointsMultiplier.findFirst({
            where: and(
              eq(seasonPointsMultiplier.userId, input.userId),
              eq(seasonPointsMultiplier.weekId, input.weekId),
            ),
            columns: {
              multiplier: true,
            },
          }),
        catch: (error) => new DbError(error),
      });

      return {
        value: result?.multiplier ?? '0',
      };
    });

    const getSeasonPointsRankingByUserId = Effect.fn(function* (input: {
      userId: string;
      weekId: string;
    }) {
      const userSeasonPointsSQL = sql<number>`(
        SELECT SUM(${userSeasonPoints.points})
        FROM ${userSeasonPoints}
        WHERE ${userSeasonPoints.userId} = ${input.userId}
      )`;

      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              points: userSeasonPointsSQL,
              rank: sql<number>`(
                SELECT COUNT(*) + 1 
                FROM ${userSeasonPoints} up2 
                WHERE up2.week_id = ${input.weekId} 
                AND up2.points > ${userSeasonPointsSQL}
              )`,
            })
            .from(userSeasonPoints)
            .then((result) => result[0]),
        catch: (error) => new DbError(error),
      });

      if (!result || result?.points === null) {
        return {
          rank: 'n/a',
          points: '0',
        };
      }

      return {
        rank: result.rank,
        points: result.points.toString(),
      };
    });

    const getUserCategoryBreakdown = Effect.fn(function* (input: {
      weekId: string;
      userId: string;
    }) {
      // Get user's category points from leaderboard cache
      const userCategoryPoints = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              categoryId: categoryLeaderboardCache.categoryId,
              categoryName: activityCategories.name,
              totalPoints: categoryLeaderboardCache.totalPoints,
              activityBreakdown: categoryLeaderboardCache.activityBreakdown,
            })
            .from(categoryLeaderboardCache)
            .innerJoin(
              activityCategories,
              eq(categoryLeaderboardCache.categoryId, activityCategories.id),
            )
            .where(
              and(
                eq(categoryLeaderboardCache.weekId, input.weekId),
                eq(categoryLeaderboardCache.userId, input.userId),
              ),
            ),
        catch: (error) => new DbError(error),
      });

      // Transform cache data to expected format
      const categoryBreakdown = userCategoryPoints.map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        points: Math.round(Number.parseFloat(category.totalPoints || '0')),
        activityBreakdown: category.activityBreakdown as Record<
          string,
          number
        > | null,
      }));

      return categoryBreakdown;
    });

    const getUserWeekActivityPoints = Effect.fn(function* (input: {
      userId: string;
      weekId: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              totalPoints: sum(accountActivityPoints.activityPoints).as(
                'totalPoints',
              ),
            })
            .from(accountActivityPoints)
            .innerJoin(
              accounts,
              eq(accountActivityPoints.accountAddress, accounts.address),
            )
            .innerJoin(
              activities,
              eq(accountActivityPoints.activityId, activities.id),
            )
            .where(
              and(
                eq(accounts.userId, input.userId),
                eq(accountActivityPoints.weekId, input.weekId),
                // Exclude hold_ activities and common like other functions
                sql`${activities.id} NOT LIKE '%hold_%'`,
                sql`${activities.id} != 'common'`,
              ),
            )
            .then((result) => result[0]),
        catch: (error) => new DbError(error),
      });

      return {
        weekId: input.weekId,
        totalPoints: result?.totalPoints
          ? Number.parseFloat(result.totalPoints)
          : 0,
      };
    });

    const getTotalUserCount = Effect.fn(function* () {
      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select({ count: count() })
            .from(users)
            .then((result) => result[0]?.count || 0),
        catch: (error) => new DbError(error),
      });
      return result;
    });

    const getUserByIdentityAddress = Effect.fn(function* (input: {
      identityAddress: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(users)
            .where(eq(users.identityAddress, input.identityAddress))
            .then((result) => result[0]),
        catch: (error) => new DbError(error),
      });

      if (!result) {
        return yield* Effect.fail(
          new UserNotFoundError({ identityAddress: input.identityAddress }),
        );
      }

      return result;
    });

    const getAccountsByUserId = Effect.fn(function* (input: {
      userId: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db.select().from(accounts).where(eq(accounts.userId, input.userId)),
        catch: (error) => new DbError(error),
      });
      return result;
    });

    const getUserIdByAccountAddress = Effect.fn(function* (input: {
      accountAddress: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select({ userId: accounts.userId })
            .from(accounts)
            .where(eq(accounts.address, input.accountAddress))
            .then((result) => result[0]?.userId),
        catch: (error) => new DbError(error),
      });

      if (!result) {
        return yield* Effect.fail(new UserNotFoundError({}));
      }

      return result;
    });

    const buildAnonymousUserData = Effect.fn(function* (input: {
      activeActivityIds: string[];
      activityNamesMap: Map<string, string | null | undefined>;
    }) {
      // Get categories with activities, all dapps for activities, token metadata, and metadata URLs
      const [
        categoriesWithActiveActivities,
        dappMap,
        tokensMap,
        metadataUrlMap,
      ] = yield* Effect.all([
        activityService.getCategoriesWithActiveActivities(
          input.activeActivityIds,
        ),
        activityService.getDappForActivities(input.activeActivityIds),
        activityService.getTokensForActivities(input.activeActivityIds),
        activityService.getMetadataUrlForActivities(input.activeActivityIds),
      ]);

      const result: AnonymousUserData = [];

      // Process each category that has active activities
      for (const categoryId of categoriesWithActiveActivities) {
        const activities = [];

        // Get individual activities for this category (only active ones)
        for (const activityId of input.activeActivityIds) {
          if (activityToCategoryMap.get(activityId) === categoryId) {
            const dapp = dappMap.get(activityId);
            const tokens = tokensMap.get(activityId);
            const metadataUrl = metadataUrlMap.get(activityId);

            activities.push({
              activityId,
              activityName: input.activityNamesMap.get(activityId),
              capitalAtWork: '0',
              earnedAP: '0',
              apPerHour: null,
              dapp: dapp
                ? {
                    id: dapp.id,
                    name: dapp.name,
                    website: dapp.website,
                  }
                : null,
              tokens: tokens || null,
              metadataUrl: metadataUrl || null,
            });
          }
        }

        result.push({
          categoryId,
          capitalAtWork: '0',
          earnedAP: '0',
          apPerHour: null,
          activities,
        });
      }

      return result;
    });

    const getUserCapitalAtWork = Effect.fn(function* (input: {
      userId?: string;
      weekId: string;
    }) {
      // Get activities with multipliers and names for the week
      const activitiesWithMultipliers =
        yield* activityWeekService.getActivitiesWithMultipliers(input.weekId);

      // Filter activities to only include those with multiplier > 0
      const activeActivities = activitiesWithMultipliers.filter(
        (activity) => Number.parseFloat(activity.multiplier) > 0,
      );

      const activeActivityIds = activeActivities.map(
        (activity) => activity.activityId,
      );

      // Create a map for activity names
      const activityNamesMap = new Map(
        activeActivities.map((activity) => [
          activity.activityId,
          activity.activityName,
        ]),
      );

      // If no userId provided (anonymous user), return all active activities with empty data
      if (!input.userId) {
        return yield* buildAnonymousUserData({
          activeActivityIds,
          activityNamesMap,
        });
      }

      // For authenticated users, get their data
      const [userAccounts, categoryBreakdown] = yield* Effect.all([
        getAccountsByUserId({ userId: input.userId }),
        getUserCategoryBreakdown({
          userId: input.userId,
          weekId: input.weekId,
        }),
      ]);

      const accountAddresses = userAccounts.map((account) => account.address);

      // Get capital aggregation if user has accounts
      const { capitalByCategory, capitalByActivity } =
        accountAddresses.length > 0
          ? yield* Effect.gen(function* () {
              const latestBalances =
                yield* accountBalanceService.getLatest(accountAddresses);
              return yield* accountBalanceService.aggregateCapitalByActivity({
                latestBalances,
                activeActivityIds,
                activityToCategoryMap,
              });
            })
          : {
              capitalByCategory: new Map<string, BigNumber>(),
              capitalByActivity: new Map<string, BigNumber>(),
            };

      // Create lookup for earned AP by category from existing service result
      const earnedAPByCategory = new Map(
        categoryBreakdown.map((item) => [item.categoryId, item.points]),
      );

      // Create lookup for individual activity AP from activity breakdown (only active activities)
      const earnedAPByActivity = new Map<string, number>();
      for (const category of categoryBreakdown) {
        if (category.activityBreakdown) {
          for (const [activityId, points] of Object.entries(
            category.activityBreakdown,
          )) {
            // Only include activities with multiplier > 0
            if (activeActivityIds.includes(activityId)) {
              earnedAPByActivity.set(activityId, points);
            }
          }
        }
      }

      const hoursInWeek = 7 * 24;
      const result = [];

      // Get all categories that have active activities, batch load dapps, token metadata, and metadata URLs
      const [
        categoriesWithActiveActivities,
        dappMap,
        tokensMap,
        metadataUrlMap,
      ] = yield* Effect.all([
        activityService.getCategoriesWithActiveActivities(activeActivityIds),
        activityService.getDappForActivities(activeActivityIds),
        activityService.getTokensForActivities(activeActivityIds),
        activityService.getMetadataUrlForActivities(activeActivityIds),
      ]);

      // Process each category that has active activities
      for (const categoryId of categoriesWithActiveActivities) {
        const capitalAtWork =
          capitalByCategory.get(categoryId) || new BigNumber(0);
        const earnedAP = earnedAPByCategory.get(categoryId) || 0;

        // Calculate AP/hour only for categories that have capital contribution
        // Exception: maintainXrdBalance should not show AP/hour
        const apPerHour =
          categoryId === 'maintainXrdBalance'
            ? null
            : capitalAtWork.dividedBy(hoursInWeek);

        // Get individual activities for this category (only active ones)
        const activities = [];
        for (const activityId of activeActivityIds) {
          if (activityToCategoryMap.get(activityId) === categoryId) {
            const activityCapital =
              capitalByActivity.get(activityId) || new BigNumber(0);
            const activityAP = earnedAPByActivity.get(activityId) || 0;
            const activityAPPerHour =
              categoryId === 'maintainXrdBalance'
                ? null
                : activityCapital.dividedBy(hoursInWeek);

            const dapp = dappMap.get(activityId);
            const tokens = tokensMap.get(activityId);
            const metadataUrl = metadataUrlMap.get(activityId);
            activities.push({
              activityId,
              activityName: activityNamesMap.get(activityId),
              capitalAtWork: activityCapital.toString(),
              earnedAP: activityAP.toString(),
              apPerHour: activityAPPerHour?.toString() || null,
              dapp: dapp
                ? {
                    id: dapp.id,
                    name: dapp.name,
                    website: dapp.website,
                  }
                : null,
              tokens: tokens || null,
              metadataUrl: metadataUrl || null,
            });
          }
        }

        result.push({
          categoryId,
          capitalAtWork: capitalAtWork.toString(),
          earnedAP: earnedAP.toString(),
          apPerHour: apPerHour?.toString() || null,
          activities,
        });
      }

      return result;
    });

    const getAccountAddressesByUserId = Effect.fn(function* (input: {
      userId: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select({ address: accounts.address })
            .from(accounts)
            .where(eq(accounts.userId, input.userId)),
        catch: (error) => new DbError(error),
      });
      return result.map((r) => r.address);
    });

    const userHasRegisteredAccounts = Effect.fn(function* (input: {
      userId: string;
    }) {
      const result = yield* getAccountAddressesByUserId(input);
      if (result.length === 0) {
        return yield* Effect.fail(
          new UserHasNoAccountsError({
            message: `User ${input.userId} has no registered account addresses`,
          }),
        );
      }
      return result;
    });

    return {
      getUserStats: Effect.fn(function* (input: {
        userId: string;
        weekId: string;
        seasonId: string;
      }) {
        const activityPoints = yield* getUserWeekActivityPoints(input);
        const currentSeasonPoints =
          yield* getSeasonPointsRankingByUserId(input);
        const multiplier = yield* getMultiplierByUserId(input);

        return {
          activityPoints,
          seasonPoints: currentSeasonPoints,
          multiplier,
        };
      }),
      getUserCategoryBreakdown,
      getUserWeekActivityPoints,
      getTotalUserCount,
      getUserCapitalAtWork,
      getAccountsByUserId,
      getMultiplierByUserId,
      getUserByIdentityAddress,
      getUserIdByAccountAddress,
      getAccountAddressesByUserId,
      userHasRegisteredAccounts,
      getUser: Effect.fnUntraced(function* (input: { userId: string }) {
        return yield* Effect.tryPromise({
          try: () => db.select().from(users).where(eq(users.id, input.userId)),
          catch: (error) => new DbError(error),
        }).pipe(Effect.map(([user]) => user));
      }),
      setEmail: Effect.fnUntraced(function* ({
        userId,
        email,
      }: UserEmailInput) {
        yield* Effect.tryPromise({
          try: () =>
            db.update(users).set({ email }).where(eq(users.id, userId)),
          catch: (error) => new DbError(error),
        });
      }),
    };
  }),
}) {}

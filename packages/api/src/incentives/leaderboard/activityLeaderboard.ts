import { Effect } from "effect";
import { DbClientService } from "../db/dbClient";
import {
  accountActivityPoints,
  accounts,
  users,
  activities,
  weeks,
  seasons,
} from "db/incentives";
import { eq, desc, asc, sum, sql, and, not, inArray } from "drizzle-orm";
import { BigNumber } from "bignumber.js";

// Manual exclude list for activities that should be temporarily hidden
// These can be removed in the future when they have meaningful data
const MANUALLY_EXCLUDED_ACTIVITIES = [
  "c9_lp_hyperstake",
  "c9_lp_lsulp-xrd",
  "oci_lp_hyperstake",
  "oci_lp_lsulp-xrd",
];

export interface ActivityLeaderboardData {
  topUsers: Array<{
    userId: string;
    identityAddress: string;
    label: string | null;
    totalPoints: string;
    rank: number;
  }>;
  userStats: {
    rank: number;
    totalPoints: string;
    percentile: number;
    accountContributions?: Array<{
      accountAddress: string;
      accountLabel: string;
      points: string;
    }>;
  } | null;
  globalStats: {
    totalUsers: number;
    median: string;
    average: string;
  };
  activityInfo: {
    id: string;
    name: string;
    description: string | null;
  };
  weekInfo: {
    id: string;
    startDate: Date;
    endDate: Date;
  };
}

export class ActivityLeaderboardService extends Effect.Service<ActivityLeaderboardService>()(
  "ActivityLeaderboardService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      const getActivityLeaderboard = Effect.fn(function* (input: {
        activityId: string;
        weekId: string;
        userId?: string;
      }) {
        // Get activity info
        const activityInfo = yield* Effect.tryPromise(() =>
          db
            .select({
              id: activities.id,
              name: activities.name,
              description: activities.description,
            })
            .from(activities)
            .where(eq(activities.id, input.activityId))
            .limit(1)
            .then((result) => result[0])
        );

        if (!activityInfo) {
          return yield* Effect.fail(new Error("Activity not found"));
        }

        // Get week info
        const weekInfo = yield* Effect.tryPromise(() =>
          db
            .select({
              id: weeks.id,
              startDate: weeks.startDate,
              endDate: weeks.endDate,
            })
            .from(weeks)
            .where(eq(weeks.id, input.weekId))
            .limit(1)
            .then((result) => result[0])
        );

        if (!weekInfo) {
          return yield* Effect.fail(new Error("Week not found"));
        }

        // Query account activity points table for all activity types
        const getDataFromTable = () => {
          return db
            .select({
              userId: accounts.userId,
              identityAddress: users.identityAddress,
              label: users.label,
              totalPoints: sum(accountActivityPoints.activityPoints).as(
                "totalPoints"
              ),
            })
            .from(accountActivityPoints)
            .innerJoin(
              accounts,
              eq(accountActivityPoints.accountAddress, accounts.address)
            )
            .innerJoin(users, eq(accounts.userId, users.id))
            .where(
              and(
                eq(accountActivityPoints.activityId, input.activityId),
                eq(accountActivityPoints.weekId, input.weekId)
              )
            )
            .groupBy(accounts.userId, users.identityAddress, users.label)
            .orderBy(desc(sum(accountActivityPoints.activityPoints)));
        };

        // Aggregate data by user (sum across all their accounts)
        const userTotals = yield* Effect.tryPromise(() => getDataFromTable());

        // Calculate statistics
        const totalUsers = userTotals.length;
        const pointsArray = userTotals.map(
          (user) => new BigNumber(user.totalPoints || "0")
        );

        const average = pointsArray
          .reduce((acc, points) => acc.plus(points), new BigNumber(0))
          .dividedBy(totalUsers || 1)
          .toFixed(6);

        // Calculate median
        const sortedPoints = pointsArray.sort((a, b) => a.comparedTo(b) || 0);
        let median: string;

        if (totalUsers > 0) {
          if (totalUsers % 2 === 0) {
            const mid1 =
              sortedPoints[Math.floor(totalUsers / 2) - 1] ?? new BigNumber(0);
            const mid2 =
              sortedPoints[Math.floor(totalUsers / 2)] ?? new BigNumber(0);
            median = mid1.plus(mid2).dividedBy(2).toFixed(6);
          } else {
            const mid =
              sortedPoints[Math.floor(totalUsers / 2)] ?? new BigNumber(0);
            median = mid.toFixed(6);
          }
        } else {
          median = "0";
        }

        // Get top 5 users
        const topUsers = userTotals.slice(0, 5).map((user, index) => ({
          userId: user.userId,
          identityAddress: user.identityAddress,
          label: user.label,
          totalPoints: user.totalPoints?.toString() || "0",
          rank: index + 1,
        }));

        // Get user stats if userId provided
        let userStats = null;
        if (input.userId) {
          const userIndex = userTotals.findIndex(
            (user) => user.userId === input.userId
          );
          if (userIndex !== -1) {
            const userTotal = userTotals[userIndex];
            const rank = userIndex + 1;
            const percentile = Math.round((1 - (rank - 1) / totalUsers) * 100);

            // Get account contributions for this user from accountActivityPoints table
            const getAccountContributions = async () => {
              return await db
                .select({
                  accountAddress: accounts.address,
                  accountLabel: accounts.label,
                  points: accountActivityPoints.activityPoints,
                })
                .from(accountActivityPoints)
                .innerJoin(
                  accounts,
                  eq(accountActivityPoints.accountAddress, accounts.address)
                )
                .where(
                  and(
                    eq(accountActivityPoints.activityId, input.activityId),
                    eq(accountActivityPoints.weekId, input.weekId),
                    // biome-ignore lint/style/noNonNullAssertion: userId is checked above
                    eq(accounts.userId, input.userId!)
                  )
                )
                .orderBy(desc(accountActivityPoints.activityPoints));
            };

            const accountContributions = yield* Effect.tryPromise(
              getAccountContributions
            );

            userStats = {
              rank,
              totalPoints: userTotal?.totalPoints?.toString() || "0",
              percentile,
              accountContributions: accountContributions.map((acc) => ({
                accountAddress: acc.accountAddress,
                accountLabel: acc.accountLabel,
                points: (acc.points || 0).toString(),
              })),
            };
          }
        }

        return {
          topUsers,
          userStats,
          globalStats: {
            totalUsers,
            median,
            average,
          },
          activityInfo,
          weekInfo,
        };
      });

      const getAvailableWeeks = Effect.fn(function* (input: {
        seasonId?: string;
      }) {
        const query = db
          .select({
            id: weeks.id,
            seasonId: weeks.seasonId,
            startDate: weeks.startDate,
            endDate: weeks.endDate,
            status: weeks.status,
            seasonName: seasons.name,
          })
          .from(weeks)
          .innerJoin(seasons, eq(weeks.seasonId, seasons.id));

        if (input.seasonId) {
          query.where(eq(weeks.seasonId, input.seasonId));
        }

        return yield* Effect.tryPromise(() =>
          query.orderBy(desc(weeks.startDate))
        );
      });

      const getAvailableActivities = Effect.fn(function* () {
        return yield* Effect.tryPromise(() =>
          db
            .select({
              id: activities.id,
              name: activities.name,
              description: activities.description,
              category: activities.category,
            })
            .from(activities)
            .where(
              and(
                // Exclude hold_ activities (they're for multiplier calculation, not leaderboards)
                sql`${activities.id} NOT LIKE '%hold_%'`,
                // Exclude common activity (not rewarded)
                sql`${activities.id} != 'common'`,
                // Manually exclude specific activities (can be removed in the future)
                not(inArray(activities.id, MANUALLY_EXCLUDED_ACTIVITIES))
              )
            )
            .orderBy(asc(activities.id))
        );
      });

      return {
        getActivityLeaderboard,
        getAvailableWeeks,
        getAvailableActivities,
      };
    }),
  }
) {}

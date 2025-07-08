import { Effect } from "effect";
import { DbClientService } from "../db/dbClient";
import { userSeasonPoints, users, seasons } from "db/incentives";
import { eq, desc, sum } from "drizzle-orm";
import { BigNumber } from "bignumber.js";

export interface SeasonLeaderboardData {
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
  seasonInfo: {
    id: string;
    name: string;
  };
}

export class SeasonLeaderboardService extends Effect.Service<SeasonLeaderboardService>()(
  "SeasonLeaderboardService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      const getSeasonLeaderboard = Effect.fn(function* (input: {
        seasonId: string;
        userId?: string;
      }) {
        // Get season info
        const seasonInfo = yield* Effect.tryPromise(() =>
          db
            .select({
              id: seasons.id,
              name: seasons.name,
            })
            .from(seasons)
            .where(eq(seasons.id, input.seasonId))
            .limit(1)
            .then((result) => result[0])
        );

        if (!seasonInfo) {
          return yield* Effect.fail(new Error("Season not found"));
        }

        // Aggregate season points by user
        const userTotals = yield* Effect.tryPromise(() =>
          db
            .select({
              userId: userSeasonPoints.userId,
              identityAddress: users.identityAddress,
              label: users.label,
              totalPoints: sum(userSeasonPoints.points).as("totalPoints"),
            })
            .from(userSeasonPoints)
            .innerJoin(users, eq(userSeasonPoints.userId, users.id))
            .where(eq(userSeasonPoints.seasonId, input.seasonId))
            .groupBy(
              userSeasonPoints.userId,
              users.identityAddress,
              users.label
            )
            .orderBy(desc(sum(userSeasonPoints.points)))
        );

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
            const left = sortedPoints[Math.floor(totalUsers / 2) - 1];
            const right = sortedPoints[Math.floor(totalUsers / 2)];
            if (left !== undefined && right !== undefined) {
              median = left.plus(right).dividedBy(2).toFixed(6);
            } else {
              median = "0";
            }
          } else {
            const mid = sortedPoints[Math.floor(totalUsers / 2)];
            median = mid !== undefined ? mid.toFixed(6) : "0";
          }
        } else {
          median = "0";
        }

        // Get top 5 users
        const topUsers = userTotals.slice(0, 5).map((user, index) => ({
          userId: user.userId,
          identityAddress: user.identityAddress,
          label: user.label,
          totalPoints: user.totalPoints || "0",
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

            userStats = {
              rank,
              totalPoints: userTotal?.totalPoints || "0",
              percentile,
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
          seasonInfo,
        };
      });

      const getAvailableSeasons = Effect.fn(function* () {
        return yield* Effect.tryPromise(() =>
          db
            .select({
              id: seasons.id,
              name: seasons.name,
              startDate: seasons.startDate,
              endDate: seasons.endDate,
              status: seasons.status,
            })
            .from(seasons)
            .orderBy(desc(seasons.startDate))
        );
      });

      return {
        getSeasonLeaderboard,
        getAvailableSeasons,
      };
    }),
  }
) {}

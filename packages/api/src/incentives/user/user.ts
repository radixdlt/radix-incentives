import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import {
  accountActivityPoints,
  accounts,
  userSeasonPoints,
  seasonPointsMultiplier,
  weeks,
  seasons,
} from "db/incentives";
import { eq, desc } from "drizzle-orm";
import { groupBy } from "effect/Array";
import BigNumber from "bignumber.js";

export class UserService extends Effect.Service<UserService>()("UserService", {
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;

    const getActivityPointsByUserId = Effect.fn(function* (input: {
      userId: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              accountAddress: accounts.address,
              activityId: accountActivityPoints.activityId,
              activityPoints: accountActivityPoints.activityPoints,
              weekId: accountActivityPoints.weekId,
            })
            .from(accounts)
            .where(eq(accounts.userId, input.userId))
            .innerJoin(
              accountActivityPoints,
              eq(accountActivityPoints.accountAddress, accounts.address)
            ),
        catch: (error) => new DbError(error),
      });

      const groupedByWeek = groupBy(result, (point) => point.weekId);

      return Object.entries(groupedByWeek).map(([weekId, points]) => {
        const groupedByActivity = groupBy(points, (point) => point.activityId);
        return {
          weekId,
          activities: Object.entries(groupedByActivity).map(
            ([activityId, points]) => ({
              activityId,
              points: points
                .reduce(
                  (sum, point) => sum.plus(point.activityPoints),
                  new BigNumber(0)
                )
                .toNumber(),
            })
          ),
        };
      });
    });

    const getCurrentSeasonPointsByUserId = Effect.fn(function* (input: {
      userId: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              seasonId: userSeasonPoints.seasonId,
              points: userSeasonPoints.points,
            })
            .from(userSeasonPoints)
            .where(eq(userSeasonPoints.userId, input.userId))
            .innerJoin(seasons, eq(userSeasonPoints.seasonId, seasons.id))
            .orderBy(desc(seasons.endDate))
            .limit(1)
            .then((result) => result[0]),
        catch: (error) => new DbError(error),
      });

      return result?.points ?? 0;
    });

    const getMultiplierByUserId = Effect.fn(function* (input: {
      userId: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              multiplier: seasonPointsMultiplier.multiplier,
              userId: seasonPointsMultiplier.userId,
            })
            .from(seasonPointsMultiplier)
            .where(eq(seasonPointsMultiplier.userId, input.userId))
            .innerJoin(weeks, eq(seasonPointsMultiplier.weekId, weeks.id))
            .orderBy(desc(weeks.endDate))
            .then((result) =>
              result.map((r) => ({
                ...r,
                multiplier: new BigNumber(r.multiplier),
              }))
            ),
        catch: (error) => new DbError(error),
      });

      const sortedByMultiplier = result.sort((a, b) =>
        b.multiplier.minus(a.multiplier).toNumber()
      );

      const userRank = sortedByMultiplier.findIndex(
        (r) => r.userId === input.userId
      );

      const isTop5Percentile = userRank < Math.floor(result.length * 0.05);

      return {
        weeklyRanking: userRank + 1,
        isTop5Percentile,
        value: sortedByMultiplier[userRank]?.multiplier.toString() ?? "0",
      };
    });
    return {
      getUserStats: Effect.fn(function* (input: { userId: string }) {
        const activityPoints = yield* getActivityPointsByUserId(input);
        const currentSeasonPoints =
          yield* getCurrentSeasonPointsByUserId(input);
        const multiplier = yield* getMultiplierByUserId(input);

        return {
          activityPoints,
          seasonPoints: currentSeasonPoints,
          multiplier,
        };
      }),
      getAccountsByUserId: Effect.fn(function* (input: { userId: string }) {
        const result = yield* Effect.tryPromise({
          try: () =>
            db.select().from(accounts).where(eq(accounts.userId, input.userId)),
          catch: (error) => new DbError(error),
        });
        return result;
      }),
    };
  }),
}) {}

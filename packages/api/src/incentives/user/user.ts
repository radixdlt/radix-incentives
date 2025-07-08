import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import {
  accountActivityPoints,
  accounts,
  userSeasonPoints,
  seasonPointsMultiplier,
} from "db/incentives";
import { eq, sql, and } from "drizzle-orm";
import { groupBy } from "effect/Array";
import BigNumber from "bignumber.js";

export class UserService extends Effect.Service<UserService>()("UserService", {
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;

    const getActivityPointsByUserId = Effect.fn(function* (input: {
      userId: string;
      weekId: string;
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

    const getMultiplierByUserId = Effect.fn(function* (input: {
      userId: string;
      weekId: string;
    }) {
      const result = yield* Effect.tryPromise({
        try: () =>
          db.query.seasonPointsMultiplier.findFirst({
            where: and(
              eq(seasonPointsMultiplier.userId, input.userId),
              eq(seasonPointsMultiplier.weekId, input.weekId)
            ),
            columns: {
              multiplier: true,
            },
          }),
        catch: (error) => new DbError(error),
      });

      return {
        value: result?.multiplier ?? "0",
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
          rank: "n/a",
          points: "0",
        };
      }

      return {
        rank: result.rank,
        points: result.points.toString(),
      };
    });

    return {
      getUserStats: Effect.fn(function* (input: {
        userId: string;
        weekId: string;
        seasonId: string;
      }) {
        const activityPoints = yield* getActivityPointsByUserId(input);
        const currentSeasonPoints =
          yield* getSeasonPointsRankingByUserId(input);
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

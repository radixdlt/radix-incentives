import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import {
  accountActivityPoints,
  accounts,
  seasonPointsMultiplier,
} from "db/incentives";
import { and, asc, eq, gte, sum } from "drizzle-orm";
import BigNumber from "bignumber.js";

export class UserActivityPointsService extends Effect.Service<UserActivityPointsService>()(
  "UserActivityPointsService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        getByWeekIdAndActivityId: Effect.fn(function* (input: {
          weekId: string;
          activityId: string;
          minPoints: number;
          minTWABalance: number;
        }) {
          const result = yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  userId: accounts.userId,
                  points: sum(accountActivityPoints.activityPoints),
                })
                .from(accountActivityPoints)
                .where(
                  and(
                    eq(accountActivityPoints.weekId, input.weekId),
                    eq(accountActivityPoints.activityId, input.activityId),
                    gte(
                      seasonPointsMultiplier.totalTWABalance,
                      input.minTWABalance.toString()
                    )
                  )
                )
                .innerJoin(
                  accounts,
                  eq(accounts.address, accountActivityPoints.accountAddress)
                )
                .innerJoin(
                  seasonPointsMultiplier,
                  and(
                    eq(seasonPointsMultiplier.userId, accounts.userId),
                    eq(seasonPointsMultiplier.weekId, input.weekId)
                  )
                )
                .groupBy(accounts.userId)
                .having(
                  gte(
                    sum(accountActivityPoints.activityPoints),
                    input.minPoints
                  )
                )
                .orderBy(asc(sum(accountActivityPoints.activityPoints))),
            catch: (error) => new DbError(error),
          });

          return result
            .map((row) => ({
              userId: row.userId,
              points: new BigNumber(row.points ?? 0),
            }))
            .filter((row) => !row.points.isZero());
        }),
      };
    }),
  }
) {}

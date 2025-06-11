import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import { accountActivityPoints, accounts } from "db/incentives";
import { and, asc, eq, gte } from "drizzle-orm";
import BigNumber from "bignumber.js";

export class NotFoundError {
  readonly _tag = "NotFoundError";
  constructor(readonly message: string) {}
}

export type GetUserActivityPointsError = DbError | NotFoundError;

export class GetUserActivityPointsService extends Context.Tag(
  "GetUserActivityPointsService"
)<
  GetUserActivityPointsService,
  (input: {
    weekId: string;
    activityId: string;
    minPoints: number;
  }) => Effect.Effect<
    { userId: string; points: BigNumber }[],
    GetUserActivityPointsError,
    DbClientService
  >
>() {}

export const GetUserActivityPointsLive = Layer.effect(
  GetUserActivityPointsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .select({
                userId: accounts.userId,
                accountAddress: accountActivityPoints.accountAddress,
                activityPoints: accountActivityPoints.activityPoints,
              })
              .from(accountActivityPoints)
              .where(
                and(
                  eq(accountActivityPoints.weekId, input.weekId),
                  eq(accountActivityPoints.activityId, input.activityId),
                  gte(accountActivityPoints.activityPoints, input.minPoints)
                )
              )
              .innerJoin(
                accounts,
                eq(accounts.address, accountActivityPoints.accountAddress)
              )
              .orderBy(asc(accountActivityPoints.activityPoints)),
          catch: (error) => new DbError(error),
        });

        const groupedByUserId = result.reduce(
          (acc, curr) => {
            acc[curr.userId] = acc[curr.userId] || new BigNumber(0);
            acc[curr.userId] = acc[curr.userId].plus(curr.activityPoints);
            return acc;
          },
          {} as Record<string, BigNumber>
        );

        // sort by points in ascending order
        const sortedByPointsAsc = Object.entries(groupedByUserId)
          .map(([userId, points]) => ({
            userId,
            points,
          }))
          .sort((a, b) => a.points.comparedTo(b.points) ?? 0);

        return sortedByPointsAsc;
      });
  })
);

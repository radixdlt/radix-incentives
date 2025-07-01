import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import {
  GetUserTWAXrdBalanceService,
  type UsersWithTwaBalance,
} from "./getUserTWAXrdBalance";
import { BigNumber } from "bignumber.js";

import { z } from "zod";
import { InvalidInputError } from "../../common/errors";
import { chunker } from "../../common";
import { accounts, users } from "db/incentives";
import { inArray, lte, eq } from "drizzle-orm";
import {
  type GetWeekByIdError,
  GetWeekByIdService,
  type WeekNotFoundError,
} from "../week/getWeekById";
import { UpsertUserTwaWithMultiplierService } from "./upsertUserTwaWithMultiplier";

export const seasonPointsMultiplierJobSchema = z.object({
  weekId: z.string(),
  userIds: z.array(z.string()).optional(),
});

export type SeasonPointsMultiplierJob = z.infer<
  typeof seasonPointsMultiplierJobSchema
>;

// Multiplier calculation function

export const calculateMultiplier = (
  q: number,
  constants: { K: number; Q0: number; QLowerCap: number; QUpperCap: number } = {
    K: 15,
    Q0: 0.18,
    QLowerCap: 0.02,
    QUpperCap: 0.5,
  }
): number => {
  const K = constants.K;
  const Q0 = constants.Q0;
  const QLowerCap = constants.QLowerCap;
  const QUpperCap = constants.QUpperCap;

  if (q < QLowerCap) {
    return 0.5;
  }
  if (q < QUpperCap && q >= QLowerCap) {
    return 0.5 + 2.5 / (1 + Math.exp(-K * (q - Q0)));
  }
  if (q >= QUpperCap) {
    return 3.0;
  }
  return 0;
};

const applyMultiplierToUsers = (
  users: Array<{
    userId: string;
    totalTWABalance: string;
    cumulativeTWABalance: string;
    weekId: string;
  }>,
  totalTwaBalanceSum: string
) => {
  return users.map((user) => {
    const q = new BigNumber(user.cumulativeTWABalance)
      .dividedBy(totalTwaBalanceSum)
      .toNumber();
    return {
      ...user,
      multiplier: calculateMultiplier(q).toString(),
    };
  });
};

// Calculate cumulativeTwaBalance for each user
const calculateCumulativeTwaBalances = (
  users: UsersWithTwaBalance[],
  weekId: string
) => {
  let cumulative = new BigNumber(0);
  return users.map((user) => {
    cumulative = cumulative.plus(user.totalTWABalance);
    return {
      userId: user.userId,
      totalTWABalance: user.totalTWABalance.toString(),
      cumulativeTWABalance: cumulative.toString(),
      weekId: weekId,
    };
  });
};

export class SeasonPointsMultiplierWorkerService extends Context.Tag(
  "SeasonPointsMultiplierWorkerService"
)<
  SeasonPointsMultiplierWorkerService,
  (
    input: SeasonPointsMultiplierJob
  ) => Effect.Effect<
    void,
    InvalidInputError | DbError | WeekNotFoundError | GetWeekByIdError
  >
>() {}

export const SeasonPointsMultiplierWorkerLive = Layer.effect(
  SeasonPointsMultiplierWorkerService,
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const getUserTWAXrdBalanceService = yield* GetUserTWAXrdBalanceService;
    const getWeekByIdService = yield* GetWeekByIdService;
    const upsertUserTwaWithMultiplier =
      yield* UpsertUserTwaWithMultiplierService;
    return (input) =>
      Effect.gen(function* () {
        yield* Effect.log("Calculating season points multiplier");
        const parsedInput = seasonPointsMultiplierJobSchema.safeParse(input);
        if (!parsedInput.success) {
          return yield* Effect.fail(new InvalidInputError(parsedInput.error));
        }

        const week = yield* getWeekByIdService({ id: input.weekId });
        const userIds = parsedInput.data.userIds;

        const getPaginatedUserIds = ({
          offset = 0,
          limit = 10000,
          createdAt,
        }: {
          weekId: string;
          offset: number;
          limit?: number;
          createdAt: Date;
        }) =>
          Effect.tryPromise({
            try: () =>
              db
                .select({ userId: users.id })
                .from(users)
                .where(lte(users.createdAt, createdAt))
                .limit(limit)
                .offset(offset)
                .then((res) => res.map((r) => r.userId)),
            catch: (error) => {
              console.error(error);
              return new DbError(error);
            },
          });

        const getAccountsForUserIds = (userIds: string[]) =>
          Effect.tryPromise({
            try: () =>
              db
                .select({ address: accounts.address })
                .from(users)
                .innerJoin(accounts, eq(users.id, accounts.userId))
                .where(inArray(users.id, userIds))
                .then((res) => res.map((r) => ({ address: r.address }))),
            catch: (error) => {
              console.error(error);
              return new DbError(error);
            },
          });

        let allUserTwaBalances: UsersWithTwaBalance[] = [];

        if (userIds) {
          const addresses = yield* getAccountsForUserIds(userIds);
          const results = yield* Effect.forEach(
            chunker(addresses, 1000),
            (chunk) =>
              getUserTWAXrdBalanceService({
                weekId: input.weekId,
                addresses: chunk.map(
                  (address: { address: string }) => address.address
                ),
              })
          );
          allUserTwaBalances = results.flat();
        } else {
          let offset = 0;
          const userIdsLimitPerPage = 10_000;
          let shouldContinue = true;

          while (shouldContinue) {
            const items = yield* getPaginatedUserIds({
              weekId: input.weekId,
              offset,
              limit: userIdsLimitPerPage,
              createdAt: week.endDate,
            });

            if (items.length === 0) {
              shouldContinue = false;
              break;
            }

            const addresses = yield* getAccountsForUserIds(items);

            const userTwaBalances = yield* getUserTWAXrdBalanceService({
              weekId: input.weekId,
              addresses: addresses.map(
                (address: { address: string }) => address.address
              ),
            });
            allUserTwaBalances.push(...userTwaBalances);
            offset += userIdsLimitPerPage;
          }
        }

        allUserTwaBalances.sort(
          (a: UsersWithTwaBalance, b: UsersWithTwaBalance) =>
            a.totalTWABalance.comparedTo(b.totalTWABalance) || 0
        );
        const filteredUserTwaBalances = allUserTwaBalances.filter(
          (u: UsersWithTwaBalance) => u.totalTWABalance.gte(10000)
        );
        const userTwaBalancesWithCumulative = calculateCumulativeTwaBalances(
          filteredUserTwaBalances,
          week.id
        );

        const totalTwaBalanceSum =
          userTwaBalancesWithCumulative.length > 0
            ? (userTwaBalancesWithCumulative.at(-1)?.cumulativeTWABalance ??
              "0")
            : "0";

        const userTwaWithMultiplier = applyMultiplierToUsers(
          userTwaBalancesWithCumulative,
          totalTwaBalanceSum
        );

        yield* upsertUserTwaWithMultiplier(userTwaWithMultiplier);
        yield* Effect.log("Season points multiplier calculated");
      });
  })
);

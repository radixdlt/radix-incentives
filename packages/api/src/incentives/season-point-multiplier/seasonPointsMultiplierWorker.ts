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
import { Thresholds } from "../../common/config/constants";
import {
  GetUsdValueService,
  type GetUsdValueServiceError,
} from "../token-price/getUsdValue";
import { Assets } from "../../common/assets/constants";

export const seasonPointsMultiplierJobSchema = z.object({
  weekId: z.string(),
  userIds: z.array(z.string()).optional(),
});

export type SeasonPointsMultiplierJob = z.infer<
  typeof seasonPointsMultiplierJobSchema
>;

// Multiplier calculation function

/**
 * S-curve function for calculating multiplier based on XRD balance
 * Based on the formula:
 * - m(B) = 0.5 if B < 10,000
 * - m(B) = 0.5 + 2.587/(1 + exp[-0.9×(ln(B)-14.4)]) if 10,000 ≤ B < 75,000,000
 * - m(B) = 3.0 if B ≥ 75,000,000
 */
export const calculateMultiplier = (xrdBalance: BigNumber): number => {
  if (xrdBalance.lt(10000)) {
    return 0.5;
  }
  if (xrdBalance.lt(75000000)) {
    // m(B) = 0.5 + 2.587/(1 + exp[-0.9×(ln(B)-14.4)])
    const lnB = Math.log(xrdBalance.toNumber());
    const expTerm = Math.exp(-0.9 * (lnB - 14.4));
    return 0.5 + 2.587 / (1 + expTerm);
  }
  return 3.0;
};

const applyMultiplierToUsers = (
  users: Array<{
    userId: string;
    totalTWABalance: string;
    cumulativeTWABalance: string;
    weekId: string;
  }>,
  xrdPrice: BigNumber
) => {
  return Effect.forEach(users, (user) =>
    Effect.gen(function* () {
      // Convert totalTWABalance ( USD value) to xrd amount
      const xrdAmount = new BigNumber(user.totalTWABalance).dividedBy(xrdPrice);

      // Calculate multiplier based on XRD balance
      const multiplier = calculateMultiplier(xrdAmount);

      return {
        ...user,
        multiplier: multiplier.toString(),
      };
    })
  );
};


export class SeasonPointsMultiplierWorkerService extends Context.Tag(
  "SeasonPointsMultiplierWorkerService"
)<
  SeasonPointsMultiplierWorkerService,
  (
    input: SeasonPointsMultiplierJob
  ) => Effect.Effect<
    void,
    | InvalidInputError
    | DbError
    | WeekNotFoundError
    | GetWeekByIdError
    | GetUsdValueServiceError
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
    const getUsdValueService = yield* GetUsdValueService;
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
          }).pipe(Effect.withSpan("getPaginatedUserIds"));

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
          }).pipe(Effect.withSpan("getAccountsForUserIds"));

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
          ).pipe(Effect.withSpan("getUserTWAXrdBalanceService"));
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
            yield* Effect.log(`Progress: ${offset} of userIds processed.`);
          }
        }

        allUserTwaBalances.sort(
          (a: UsersWithTwaBalance, b: UsersWithTwaBalance) =>
            a.totalTWABalance.comparedTo(b.totalTWABalance) || 0
        );

        // Split users into two groups: those with balance >= 10000 and those with balance < 10000
        const filteredUserTwaBalances = allUserTwaBalances.filter(
          (u: UsersWithTwaBalance) => u.totalTWABalance.gte(Thresholds.XRD_BALANCE_THRESHOLD)
        );
        const belowThresholdUsers = allUserTwaBalances.filter(
          (u: UsersWithTwaBalance) => u.totalTWABalance.lt(Thresholds.XRD_BALANCE_THRESHOLD)
        );

        const xrdPrice = yield* getUsdValueService({
          amount: new BigNumber(1),
          resourceAddress: Assets.Fungible.XRD,
          timestamp: new Date(), // Current timestamp
        });

        const userTwaWithMultiplier = yield* applyMultiplierToUsers(
          filteredUserTwaBalances.map(
            (user) => ({
              userId: user.userId,
              totalTWABalance: user.totalTWABalance.toString(),
              weekId: week.id,
              cumulativeTWABalance: "0", //TODO remove cumulativeTWABalance from the db
            })
          ),
          xrdPrice
        );

        // Add users with balance < 10000 with 0.0 multiplier and cumulative balance
        const belowThresholdUsersWithDefaults = belowThresholdUsers.map((user) => ({
          userId: user.userId,
          totalTWABalance: user.totalTWABalance.toString(),
          cumulativeTWABalance: "0",
          weekId: week.id,
          multiplier: "0.0",
        }));


        yield* Effect.log(`Upserting user TWA with multiplier ${userTwaWithMultiplier.length}`);
        yield* upsertUserTwaWithMultiplier(userTwaWithMultiplier);
        yield* Effect.log("Season points multiplier calculated");

        yield* Effect.log(`Upserting user TWA with multiplier ${belowThresholdUsersWithDefaults.length}`);
        yield* upsertUserTwaWithMultiplier(belowThresholdUsersWithDefaults);
      });
  })
);

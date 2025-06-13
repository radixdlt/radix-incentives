import { Context, Effect, Layer } from "effect";
import type { DbClientService, DbError } from "../db/dbClient";
import { z } from "zod";
import { GetWeekAccountBalancesService } from "../activity-points/getWeekAccountBalances";
import { calculateTWA } from "../activity-points/calculateTWA";
import {
  type GetWeekByIdError,
  GetWeekByIdService,
  type WeekNotFoundError,
} from "../week/getWeekById";
import { GetAccountAddressesService } from "../account/getAccounts";
import { UpsertUserTwaWithMultiplierService } from "./upsertUserTwaWithMultiplier";

export const calculateSPMultiplierInputSchema = z.object({
  weekId: z.string(),
  addresses: z.array(z.string()),
});

export type calculateSPMultiplierInput = z.infer<
  typeof calculateSPMultiplierInputSchema
>;

export type CalculateSPMultiplierError =
  | DbError
  | WeekNotFoundError
  | GetWeekByIdError;

export type CalculateSPMultiplierDependency =
  | DbClientService
  | GetWeekByIdService
  | GetWeekAccountBalancesService
  | GetAccountAddressesService
  | UpsertUserTwaWithMultiplierService;

export class CalculateSPMultiplierService extends Context.Tag(
  "CalculateSPMultiplierService"
)<
  CalculateSPMultiplierService,
  (
    input: calculateSPMultiplierInput
  ) => Effect.Effect<
    void,
    CalculateSPMultiplierError,
    CalculateSPMultiplierDependency
  >
>() {}

// Multiplier calculation function
const K = 15;
const Q0 = 0.18;
const QLowerCap = 0.02;
const QUpperCap = 0.50;
function calculateMultiplier(q: number): number {
  if (q < QLowerCap) {
    return 0.5;
  } else if (q < QUpperCap) {
    return 0.5 + 2.5 / (1 + Math.exp(-K * (q - Q0)));
  } else {
    return 3.0;
  }
}

function applyMultiplierToUsers(
  users: Array<{ userId: string; totalTWABalance: number; cumulativeTWABalance: number, weekId: string }>,
  totalTwaBalanceSum: number
) {
  return users.map((user) => {
    const q = user.cumulativeTWABalance / totalTwaBalanceSum;
    return {
      ...user,
      multiplier: calculateMultiplier(q).toString(),
    };
  });
}

export const CalculateSPMultiplierLive = Layer.effect(
  CalculateSPMultiplierService,
  Effect.gen(function* () {
    const getWeekById = yield* GetWeekByIdService;
    const getWeekAccountBalances = yield* GetWeekAccountBalancesService;
    const getAccounts = yield* GetAccountAddressesService;
    const upsertUserTwaWithMultiplier = yield* UpsertUserTwaWithMultiplierService;

    return (input) => {
      return Effect.gen(function* () {
        const week = yield* getWeekById({ id: input.weekId });
        
        // Fetch accounts with userId (default columns)
        const accountsWithUserId = yield* getAccounts({ createdAt: week.endDate });
        // accountsWithUserId is: Array<{ address: string, userId: string }>
        
        const items = yield* getWeekAccountBalances({
          startDate: week.startDate,
          endDate: week.endDate,
          addresses: input.addresses,
          activityId: "maintainXrdBalance",
        }).pipe(
          Effect.map((items) => {
            const twa = calculateTWA({ items, week });
            return twa;
          }),
          Effect.map((items) =>
            Object.entries(items).flatMap(([address, activities]) =>
              Object.entries(activities).map(([activityId, twaBalance]) => ({
                accountAddress: address,
                activityId,
                twaBalance: (twaBalance as { toNumber: () => number }).toNumber(),
                weekId: week.id,
              }))
            )
          )
        );

        // Aggregate sum of twaBalance for each userId
        const addressToUserId = new Map<string, string>();
        for (const { address, userId } of accountsWithUserId as Array<{ address: string; userId: string }>) {
          addressToUserId.set(address, userId);
        }

        // items is an array of { accountAddress, activityId, twaBalance, weekId }
        const userTwaMap = new Map<string, number>();
        for (const item of items as Array<{ accountAddress: string; twaBalance: number }>) {
          const userId = addressToUserId.get(item.accountAddress);
          if (!userId) continue;
          userTwaMap.set(userId, (userTwaMap.get(userId) ?? 0) + item.twaBalance);
        }
        const userTwaBalances = Array.from(userTwaMap.entries()).map(([userId, totalTWABalance]) => ({ userId, totalTWABalance }));
        // userTwaBalances: Array<{ userId: string, totalTwaBalance: number }>
        
        userTwaBalances.sort((a, b) => a.totalTWABalance - b.totalTWABalance);

        // Filter out users with totalTwaBalance less than 10000
        const filteredUserTwaBalances = userTwaBalances.filter(u => u.totalTWABalance >= 10000);

        // Calculate cumulativeTwaBalance for each user
        let cumulative = 0;
        const userTwaBalancesWithCumulative: Array<{ userId: string; totalTWABalance: number; cumulativeTWABalance: number, weekId: string }> = [];
        for (const user of filteredUserTwaBalances) {
          cumulative += user.totalTWABalance;
          userTwaBalancesWithCumulative.push({
            userId: user.userId,
            totalTWABalance: user.totalTWABalance,
            cumulativeTWABalance: cumulative,
            weekId: week.id,
          });
        }
        // userTwaBalancesWithCumulative now has: { userId, totalTwaBalance, cumulativeTwaBalance ,weekId}

        const totalTwaBalanceSum = userTwaBalancesWithCumulative.length > 0
          ? userTwaBalancesWithCumulative[userTwaBalancesWithCumulative.length - 1].cumulativeTWABalance
          : 0;
        const userTwaWithMultiplier = applyMultiplierToUsers(userTwaBalancesWithCumulative, totalTwaBalanceSum);
        // userTwaWithMultiplier: Array<{ userId, totalTwaBalance, cumulativeTwaBalance, multiplier, weekId }>

        // upsert userTwaWithMultiplier to the database
        yield* upsertUserTwaWithMultiplier(userTwaWithMultiplier);
      });
    };
  })
);
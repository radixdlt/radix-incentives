import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { z } from "zod";
import { GetWeekAccountBalancesService } from "../activity-points/getWeekAccountBalances";
import { calculateTWA } from "../activity-points/calculateTWA";
import {
  type GetWeekByIdError,
  GetWeekByIdService,
  type WeekNotFoundError,
} from "../week/getWeekById";
import { accounts } from "db/consultation";
import { lte } from "drizzle-orm";

export const GetUserTWAXrdBalanceInputSchema = z.object({
  weekId: z.string(),
  addresses: z.array(z.string()),
});

export type GetUserTWAXrdBalanceInput = z.infer<
  typeof GetUserTWAXrdBalanceInputSchema
>;

export type GetUserTWAXrdBalanceError =
  | DbError
  | WeekNotFoundError
  | GetWeekByIdError;

export type GetUserTWAXrdBalanceDependency =
  | DbClientService
  | GetWeekByIdService
  | GetWeekAccountBalancesService


export type UsersWithTwaBalance = {
  userId: string;
  totalTWABalance: number;
};

export class GetUserTWAXrdBalanceService extends Context.Tag(
  "GetUserTWAXrdBalanceService"
)<
  GetUserTWAXrdBalanceService,
  (
    input: GetUserTWAXrdBalanceInput
  ) => Effect.Effect<
    UsersWithTwaBalance[],
    GetUserTWAXrdBalanceError,
    GetUserTWAXrdBalanceDependency
  >
>() {}



export const GetUserTWAXrdBalanceLive = Layer.effect(
  GetUserTWAXrdBalanceService,
  Effect.gen(function* () {
    const getWeekById = yield* GetWeekByIdService;
    const getWeekAccountBalances = yield* GetWeekAccountBalancesService;

    return (input) => {
      return Effect.gen(function* () {
        const week = yield* getWeekById({ id: input.weekId });
        
        const items =  yield* getWeekAccountBalances({
          startDate: week.startDate,
          endDate: week.endDate,
          addresses: input.addresses,
          activityId: "maintainXrdBalance",
        }).pipe(
          Effect.flatMap((items) => {
            const twa = calculateTWA({ items, week , calculationType: "USDValue"});
            console.log(twa);
            return twa;
          }),
          Effect.map((items) =>
          {
            const resultItems = Object.entries(items).flatMap(([address, activities]) =>
              activities ? Object.entries(activities).map(([activityId, twaBalance]) => ({
                accountAddress: address,
                activityId,
                twaBalance: (twaBalance as any).toNumber(), 
                weekId: week.id,
              })) : []
            )
            return resultItems;
          }
          )
        );

        const getAccountsWithUserId = (createdAt: Date) => {
          return Effect.gen(function* () {
            const dbClient = yield* DbClientService;
            return yield* Effect.tryPromise({
              try: () => {
                return dbClient.select({ address: accounts.address, userId: accounts.userId })
                .from(accounts)
                .where(lte(accounts.createdAt, createdAt))
                .then(res => res.map(r => ({ address: r.address, userId: r.userId })));
              },
              catch: (error) => new DbError(error),
            });
          });
        };
        // accountsWithUserId is: Array<{ address: string, userId: string }>
        const accountsWithUserId = yield* getAccountsWithUserId(week.endDate);

        // Aggregate sum of twaBalance for each userId
        const addressToUserId = new Map<string, string>();
        for (const { address, userId } of accountsWithUserId as Array<{ address: string; userId: string }>) {
          addressToUserId.set(address, userId);
        }

        // items is an array of { accountAddress, activityId, twaBalance, weekId }
        const userTwaMap = new Map<string, number>();
        for (const item of items) {
          const userId = addressToUserId.get(item.accountAddress);
          if (!userId) continue;
          userTwaMap.set(userId, (userTwaMap.get(userId) ?? 0) + item.twaBalance);
        }
        
        const userTwaBalances = Array.from(userTwaMap.entries()).map(([userId, totalTWABalance]) => ({ userId, totalTWABalance }));
        // userTwaBalances: Array<{ userId: string, totalTwaBalance: number }>
        return userTwaBalances;

      });
    };
  })
);
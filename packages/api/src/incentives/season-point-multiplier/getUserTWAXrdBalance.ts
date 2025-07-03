import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { z } from "zod";
import { CalculateTWASQLService } from "../activity-points/calculateTWASQL";
import {
  type GetWeekByIdError,
  GetWeekByIdService,
  type WeekNotFoundError,
} from "../week/getWeekById";
import { accounts } from "db/consultation";
import { lte } from "drizzle-orm";
import { BigNumber } from "bignumber.js";

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

export type UsersWithTwaBalance = {
  userId: string;
  totalTWABalance: BigNumber;
};

export class GetUserTWAXrdBalanceService extends Context.Tag(
  "GetUserTWAXrdBalanceService"
)<
  GetUserTWAXrdBalanceService,
  (
    input: GetUserTWAXrdBalanceInput
  ) => Effect.Effect<UsersWithTwaBalance[], GetUserTWAXrdBalanceError>
>() {}

export const GetUserTWAXrdBalanceLive = Layer.effect(
  GetUserTWAXrdBalanceService,
  Effect.gen(function* () {
    const getWeekById = yield* GetWeekByIdService;
    const calculateTWASQL = yield* CalculateTWASQLService;
    const dbClient = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        const week = yield* getWeekById({ id: input.weekId });

        // Use SQL-based calculation for hold activities with USDValue calculation type
        const items = yield* calculateTWASQL({
          weekId: input.weekId,
          addresses: input.addresses,
          startDate: week.startDate,
          endDate: week.endDate,
          calculationType: "USDValue",
          filterType: "include_hold",
          filterZeroValues: false,
        }).pipe(
          Effect.tap(() => Effect.log("Calculated TWA XRD balance using SQL")),
          Effect.tap((items) => Effect.log(`Found ${items.length} hold activity entries`))
        );

        const getAccountsWithUserId = (createdAt: Date) => {
          return Effect.gen(function* () {
            return yield* Effect.tryPromise({
              try: () =>
                dbClient
                  .select({
                    address: accounts.address,
                    userId: accounts.userId,
                  })
                  .from(accounts)
                  .where(lte(accounts.createdAt, createdAt))
                  .then((res) =>
                    res.map((r) => ({ address: r.address, userId: r.userId }))
                  ),
              catch: (error) => new DbError(error),
            });
          });
        };
        
        // accountsWithUserId is: Array<{ address: string, userId: string }>
        const accountsWithUserId = yield* getAccountsWithUserId(week.endDate);

        // Aggregate sum of twaBalance for each userId
        const addressToUserId = new Map<string, string>();
        for (const { address, userId } of accountsWithUserId) {
          addressToUserId.set(address, userId);
        }

        // items now contains { accountAddress, activityId, activityPoints, weekId }
        // where activityPoints represents the TWA balance for hold activities
        const userTwaMap = new Map<string, BigNumber>();
        for (const item of items) {
          const userId = addressToUserId.get(item.accountAddress);
          if (!userId) continue;
          const currentBalance = userTwaMap.get(userId) ?? new BigNumber(0);
          userTwaMap.set(userId, currentBalance.plus(item.activityPoints));
        }

        const userTwaBalances = Array.from(userTwaMap.entries()).map(
          ([userId, totalTWABalance]) => ({ userId, totalTWABalance })
        );
        
        return userTwaBalances;
      });
    };
  })
);

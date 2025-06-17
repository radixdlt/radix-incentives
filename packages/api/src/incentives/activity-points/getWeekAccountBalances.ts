import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accountBalances } from "db/incentives";
import { and, gte, inArray, lt, eq } from "drizzle-orm";

type AccountBalance = {
  accountAddress: string;
  timestamp: Date;
  usdValue: string;
  activityId: string;
};
type AccountAddress = string;
type ActivityId = string;

export type GetWeekAccountBalancesInput = {
  startDate: Date;
  endDate: Date;
  addresses: string[];
  activityId?: string;
};

export type GetWeekAccountBalancesOutput = Record<
  AccountAddress,
  Record<ActivityId, AccountBalance[]>
>;

export class GetWeekAccountBalancesService extends Context.Tag(
  "GetWeekAccountBalancesService"
)<
  GetWeekAccountBalancesService,
  (
    input: GetWeekAccountBalancesInput
  ) => Effect.Effect<GetWeekAccountBalancesOutput, DbError, DbClientService>
>() { }

export const GetWeekAccountBalancesLive = Layer.effect(
  GetWeekAccountBalancesService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        const whereClauses = [
          inArray(accountBalances.accountAddress, input.addresses),
          gte(accountBalances.timestamp, input.startDate),
          lt(accountBalances.timestamp, input.endDate),
        ];
        if (input.activityId) {
          whereClauses.push(eq(accountBalances.activityId, input.activityId));
        }
        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .select({
                accountAddress: accountBalances.accountAddress,
                timestamp: accountBalances.timestamp,
                usdValue: accountBalances.usdValue,
                activityId: accountBalances.activityId,
              })
              .from(accountBalances)
              .where(and(...whereClauses)),
          catch: (error) => new DbError(error),
        });

        const grouped = result.reduce<GetWeekAccountBalancesOutput>(
          (acc, curr) => {
            const accountAddressRecord = acc[curr.accountAddress] || {};
            const activity = accountAddressRecord[curr.activityId] || [];
            activity.push(curr);
            accountAddressRecord[curr.activityId] = activity;
            acc[curr.accountAddress] = {
              ...accountAddressRecord,
              [curr.activityId]: activity,
            };
            return acc;
          },
          {}
        );

        return grouped;
      });
  })
);

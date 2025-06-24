import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import {
  type AccountBalance,
  type AccountBalanceData,
  accountBalances as accountBalancesTable,
} from "db/incentives";
import { and, gte, inArray, lt } from "drizzle-orm";

type AccountAddress = string;
type ActivityId = string;

type AccountBalanceWithData = Omit<AccountBalance, "data"> & {
  data: AccountBalanceData[];
};

export type GetWeekAccountBalancesInput = {
  startDate: Date;
  endDate: Date;
  addresses: string[];
};

export type GetWeekAccountBalancesOutput = {
  accountAddress: AccountAddress;
  activities: {
    activityId: ActivityId;
    items: (AccountBalanceData & { timestamp: Date })[];
  }[];
}[];

export class GetWeekAccountBalancesService extends Context.Tag(
  "GetWeekAccountBalancesService"
)<
  GetWeekAccountBalancesService,
  (
    input: GetWeekAccountBalancesInput
  ) => Effect.Effect<GetWeekAccountBalancesOutput, DbError, DbClientService>
>() {}

export const GetWeekAccountBalancesLive = Layer.effect(
  GetWeekAccountBalancesService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        const whereClauses = [
          inArray(accountBalancesTable.accountAddress, input.addresses),
          gte(accountBalancesTable.timestamp, input.startDate),
          lt(accountBalancesTable.timestamp, input.endDate),
        ];

        const result = yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(accountBalancesTable)
              .where(and(...whereClauses)),
          catch: (error) => new DbError(error),
        });

        const accountBalances = result as AccountBalanceWithData[];

        const grouped = accountBalances.reduce<GetWeekAccountBalancesOutput>(
          (acc, curr) => {
            const accountAddress = curr.accountAddress;
            const timestamp = curr.timestamp;

            // Find existing account or create new one
            let accountRecord = acc.find(
              (item) => item.accountAddress === accountAddress
            );
            if (!accountRecord) {
              accountRecord = {
                accountAddress,
                activities: [],
              };
              acc.push(accountRecord);
            }

            // Process each activity data item
            for (const dataItem of curr.data) {
              const activityId = dataItem.activityId;

              // Find existing activity or create new one
              let activityRecord = accountRecord.activities.find(
                (activity) => activity.activityId === activityId
              );
              if (!activityRecord) {
                activityRecord = {
                  activityId,
                  items: [],
                };
                accountRecord.activities.push(activityRecord);
              }

              // Add the data item with timestamp
              activityRecord.items.push({
                ...dataItem,
                timestamp,
              });
            }

            return acc;
          },
          []
        );

        return grouped;
      });
  })
);

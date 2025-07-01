import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { between, inArray, and } from "drizzle-orm";
import {
  type AccountBalance,
  type AccountBalanceData,
  accountBalances,
  type ActivityId,
} from "db/incentives";
import { groupBy } from "effect/Array";

type AccountBalanceWithData = AccountBalance & {
  data: AccountBalanceData[];
};

type AccountBalanceDataWithTimestamp = AccountBalanceData & {
  timestamp: Date;
};

export type AccountBalanceGroupedByAddressAndActivityId = {
  accountAddress: string;
  activities: {
    activityId: ActivityId;
    items: AccountBalanceDataWithTimestamp[];
  }[];
};

export class AccountBalanceService extends Effect.Service<AccountBalanceService>()(
  "AccountBalanceService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      const getAccountBalances = (input: {
        startDate: Date;
        endDate: Date;
        addresses: string[];
      }) =>
        Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(accountBalances)
              .where(
                and(
                  inArray(accountBalances.accountAddress, input.addresses),
                  between(
                    accountBalances.timestamp,
                    input.startDate,
                    input.endDate
                  )
                )
              )
              .then((result) => result as AccountBalanceWithData[]),
          catch: (error) => new DbError(error),
        });

      return {
        byAddressesAndDateRange: Effect.fn(function* (input: {
          startDate: Date;
          endDate: Date;
          addresses: string[];
          filterFn?: (activityId: string) => boolean;
        }) {
          const result = yield* getAccountBalances(input);
          const filterFn = input.filterFn ?? (() => true);

          const groupedByAddress = groupBy(
            result,
            (item) => item.accountAddress
          );

          const output: AccountBalanceGroupedByAddressAndActivityId[] =
            Object.entries(groupedByAddress).map(
              ([accountAddress, balances]) => {
                const flattedDataWithTimestamp = balances.flatMap((balance) =>
                  balance.data.map((data) => ({
                    ...data,
                    timestamp: balance.timestamp,
                  }))
                );

                const groupedByActivityId = groupBy(
                  flattedDataWithTimestamp,
                  (item) => item.activityId
                );

                return {
                  accountAddress,
                  activities: Object.entries(groupedByActivityId)
                    .filter(([activityId]) => filterFn(activityId))
                    .map(([activityId, data]) => ({
                      activityId: activityId as ActivityId,
                      items: data,
                    })),
                };
              }
            );

          return output;
        }),
      };
    }),
  }
) {}

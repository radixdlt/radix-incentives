import { Effect } from "effect";
import { inArray, desc } from "drizzle-orm";
import { accountBalances } from "db/incentives";
import { DbClientService, DbError } from "../db/dbClient";

export type AccountBalanceItem = {
  activityId: string;
  usdValue: string;
  metadata?: Record<string, unknown>;
};

export type LatestAccountBalance = {
  accountAddress: string;
  timestamp: Date;
  data: AccountBalanceItem[];
};

export class GetLatestAccountBalancesService extends Effect.Service<GetLatestAccountBalancesService>()("GetLatestAccountBalancesService", {
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;

    return {
      getLatestAccountBalances: (accountAddresses: string[]) =>
        Effect.gen(function* () {
          if (accountAddresses.length === 0) {
            return [];
          }

          // Get the latest snapshot for each account address
          const rawBalances = yield* Effect.tryPromise({
            try: () =>
              db
                .selectDistinctOn([accountBalances.accountAddress], {
                  accountAddress: accountBalances.accountAddress,
                  timestamp: accountBalances.timestamp,
                  data: accountBalances.data,
                })
                .from(accountBalances)
                .where(inArray(accountBalances.accountAddress, accountAddresses))
                .orderBy(accountBalances.accountAddress, desc(accountBalances.timestamp))
                .execute(),
            catch: (error) => new DbError(error),
          });

          // Cast the data to the proper type
          const latestBalances: LatestAccountBalance[] = rawBalances.map(balance => ({
            accountAddress: balance.accountAddress,
            timestamp: balance.timestamp,
            data: balance.data as AccountBalanceItem[],
          }));

          return latestBalances;
        }),
    };
  }),
}) {}
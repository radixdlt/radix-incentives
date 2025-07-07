import { Effect } from "effect";
import { inArray, desc, and, between } from "drizzle-orm";
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

export class AccountBalanceService extends Effect.Service<AccountBalanceService>()(
  "AccountBalanceService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      return {
        getLatest: (accountAddresses: string[]) =>
          Effect.gen(function* () {
            if (accountAddresses.length === 0) {
              return [];
            }
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
                  .where(
                    and(
                      inArray(accountBalances.accountAddress, accountAddresses),
                      between(
                        accountBalances.timestamp,
                        sevenDaysAgo,
                        new Date()
                      )
                    )
                  )
                  .orderBy(
                    accountBalances.accountAddress,
                    desc(accountBalances.timestamp)
                  )
                  .execute(),
              catch: (error) => new DbError(error),
            });

            // Cast the data to the proper type
            const latestBalances: LatestAccountBalance[] = rawBalances.map(
              (balance) => ({
                accountAddress: balance.accountAddress,
                timestamp: balance.timestamp,
                data: balance.data as AccountBalanceItem[],
              })
            );

            return latestBalances;
          }),
      };
    }),
  }
) {}

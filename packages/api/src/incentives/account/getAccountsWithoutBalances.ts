import { accountBalances, accounts } from 'db/incentives';
import { and, eq, isNull, lte } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';

type GetAccountsWithoutBalancesInput = {
  timestamp: Date;
};

export class GetAccountsWithoutBalancesService extends Effect.Service<GetAccountsWithoutBalancesService>()(
  'GetAccountsWithoutBalancesService',
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;

      return Effect.fn(function* (input: GetAccountsWithoutBalancesInput) {
        return yield* Effect.tryPromise({
          try: async () => {
            const result = await db
              .select({ address: accounts.address })
              .from(accounts)
              .leftJoin(
                accountBalances,
                and(
                  eq(accounts.address, accountBalances.accountAddress),
                  eq(accountBalances.timestamp, input.timestamp),
                ),
              )
              .where(
                and(
                  lte(accounts.createdAt, input.timestamp),
                  isNull(accountBalances.accountAddress),
                ),
              );

            return result.map((row) => row.address);
          },
          catch: (error) => new DbError(error),
        });
      });
    }),
  },
) {}

export const GetAccountsWithoutBalancesLive =
  GetAccountsWithoutBalancesService.Default;

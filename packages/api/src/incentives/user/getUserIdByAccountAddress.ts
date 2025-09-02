import { accounts } from 'db/incentives';
import { inArray } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

type GetAccountsByAddressInput = string[];

type AccountAddress = string;
type UserId = string;

export class GetUserIdByAccountAddressService extends Effect.Service<GetUserIdByAccountAddressService>()(
  'GetUserIdByAccountAddressService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return Effect.fn(function* (input: GetAccountsByAddressInput) {
        return yield* Effect.tryPromise({
          try: () =>
            db
              .select({
                userId: accounts.userId,
                accountAddress: accounts.address,
              })
              .from(accounts)
              .where(inArray(accounts.address, input)),
          catch: (error) => new DbError(error),
        }).pipe(
          Effect.map((result) =>
            result.reduce((acc, curr) => {
              acc.set(curr.accountAddress, curr.userId);
              return acc;
            }, new Map<AccountAddress, UserId>()),
          ),
        );
      });
    }),
  },
) {}

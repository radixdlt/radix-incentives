import { accounts } from 'db/incentives';
import { inArray } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

type GetAccountAddressByUserIdInput = string[];

type AccountAddress = string;
type UserId = string;

export class GetAccountAddressByUserIdService extends Effect.Service<GetAccountAddressByUserIdService>()(
  'GetAccountAddressByUserIdService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return Effect.fn(function* (input: GetAccountAddressByUserIdInput) {
        return yield* Effect.tryPromise({
          try: () =>
            db
              .select({
                userId: accounts.userId,
                accountAddress: accounts.address,
              })
              .from(accounts)
              .where(inArray(accounts.userId, input)),
          catch: (error) => new DbError(error),
        }).pipe(
          Effect.map((result) => {
            return result.reduce((acc, curr) => {
              const existing = acc.get(curr.userId);
              if (!existing) {
                acc.set(curr.userId, new Set([curr.accountAddress]));
              } else {
                existing.add(curr.accountAddress);
              }

              return acc;
            }, new Map<UserId, Set<AccountAddress>>());
          }),
        );
      });
    }),
  },
) {}

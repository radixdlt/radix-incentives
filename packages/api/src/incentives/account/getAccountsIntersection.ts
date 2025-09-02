import { accounts } from 'db/consultation';
import { inArray } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

type GetAccountsInput = {
  addresses: string[];
};

export class GetAccountsIntersectionService extends Effect.Service<GetAccountsIntersectionService>()(
  'GetAccountsIntersectionService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return Effect.fn(function* (input: GetAccountsInput) {
        return yield* Effect.tryPromise({
          try: () =>
            db
              .select({ address: accounts.address })
              .from(accounts)
              .where(inArray(accounts.address, input.addresses))
              .then((res) => res.map((r) => r.address)),
          catch: (err) => new DbError(err),
        });
      });
    }),
  },
) {}

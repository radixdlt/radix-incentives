import { accounts } from 'db/incentives';
import { lte } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

type GetAccountsInput = {
  createdAt: Date;
};

export class GetAccountAddressesService extends Effect.Service<GetAccountAddressesService>()(
  'GetAccountAddressesService',
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
              .where(lte(accounts.createdAt, input.createdAt))
              .then((res) => res.map((r) => r.address)),
          catch: (error) => new DbError(error),
        });
      });
    }),
  },
) {}

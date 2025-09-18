import { accounts } from 'db/incentives';
import { inArray } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

type GetAccountsByAddressInput = {
  addresses: string[];
};

export class GetAccountsByAddressService extends Effect.Service<GetAccountsByAddressService>()(
  'GetAccountsByAddressService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return Effect.fnUntraced(function* (input: GetAccountsByAddressInput) {
        return yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(accounts)
              .where(inArray(accounts.address, input.addresses)),

          catch: (error) => new DbError(error),
        });
      });
    }),
  },
) {}

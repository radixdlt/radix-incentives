import { accounts } from 'db/consultation';
import { lte } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbService } from '../db/dbClient';

type GetAccountsInput = {
  createdAt: Date;
};

export class GetAccountAddressesService extends Effect.Service<GetAccountAddressesService>()(
  'GetAccountAddressesService',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;
      return Effect.fn(function* (input: GetAccountsInput) {
        return yield* db
          .select({ address: accounts.address })
          .from(accounts)
          .where(lte(accounts.createdAt, input.createdAt))
          .pipe(Effect.map((res) => res.map((r) => r.address)));
      });
    }),
  },
) {}

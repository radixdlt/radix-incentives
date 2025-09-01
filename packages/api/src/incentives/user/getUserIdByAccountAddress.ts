import { accounts } from 'db/incentives';
import { inArray } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbService } from '../db/dbClient';

type GetAccountsByAddressInput = string[];

type AccountAddress = string;
type UserId = string;

export class GetUserIdByAccountAddressService extends Effect.Service<GetUserIdByAccountAddressService>()(
  'GetUserIdByAccountAddressService',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;
      return Effect.fn(function* (input: GetAccountsByAddressInput) {
        // Implementation goes here
        return yield* db
          .select({
            userId: accounts.userId,
            accountAddress: accounts.address,
          })
          .from(accounts)
          .where(inArray(accounts.address, input))
          .pipe(
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

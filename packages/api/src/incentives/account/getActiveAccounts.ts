import { accounts } from 'db/incentives';
import { and, eq, lte } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbService } from '../db/dbClient';

type GetActiveAccountsInput = {
  createdAt: Date;
};

/**
 * Service to get account addresses that have snapshots enabled.
 * This filters out accounts that have been deactivated due to low XRD balance.
 */
export class GetActiveAccountAddressesService extends Effect.Service<GetActiveAccountAddressesService>()(
  'GetActiveAccountAddressesService',
  {
    dependencies: [DbService.Default],
    effect: Effect.gen(function* () {
      const db = yield* DbService;
      return Effect.fn(function* (input: GetActiveAccountsInput) {
        return yield* db.use((db) =>
          db
            .select({ address: accounts.address })
            .from(accounts)
            .where(
              and(
                lte(accounts.createdAt, input.createdAt),
                eq(accounts.snapshotEnabled, true),
              ),
            )
            .then((res) => res.map((r) => r.address)),
        );
      });
    }),
  },
) {}

export const GetActiveAccountAddressesServiceLive =
  GetActiveAccountAddressesService.Default;

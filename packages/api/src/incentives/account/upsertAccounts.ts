import { accounts } from 'db/incentives';
import { sql } from 'drizzle-orm';
import { Effect } from 'effect';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';

type UpsertAccountInput = {
  userId: string;
  accounts: { address: string; label: string }[];
};

export class UpsertAccountsService extends Effect.Service<UpsertAccountsService>()(
  'UpsertAccountsService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return Effect.fnUntraced(function* (input: UpsertAccountInput) {
        return yield* Effect.tryPromise({
          try: () =>
            db
              .insert(accounts)
              .values(
                input.accounts.map((account) => ({
                  userId: input.userId,
                  ...account,
                })),
              )
              .returning()
              .onConflictDoUpdate({
                target: accounts.address,
                set: { label: sql`excluded.label` },
              }),
          catch: (error) => new DbError(error),
        });
      });
    }),
  },
) {}

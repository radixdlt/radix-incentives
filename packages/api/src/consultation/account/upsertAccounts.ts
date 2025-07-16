import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accounts } from "db/consultation";
import { sql } from "drizzle-orm";

type UpsertAccountInput = {
  userId: string;
  accounts: { address: string; label: string }[];
};

export class UpsertAccountsService extends Effect.Service<UpsertAccountsService>()(
  "UpsertAccountsService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* (input: UpsertAccountInput) {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .insert(accounts)
                .values(
                  input.accounts.map((account) => ({
                    userId: input.userId,
                    ...account,
                  }))
                )
                .returning()
                .onConflictDoUpdate({
                  target: accounts.address,
                  set: { label: sql`excluded.label` },
                }),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}

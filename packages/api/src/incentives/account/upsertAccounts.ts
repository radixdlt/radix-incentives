import { type Account, accounts } from 'db/consultation';
import { sql } from 'drizzle-orm';
import { Context, Effect, Layer } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';

type UpsertAccountInput = {
  userId: string;
  accounts: { address: string; label: string }[];
};

export class UpsertAccountsService extends Context.Tag('UpsertAccountsService')<
  UpsertAccountsService,
  (input: UpsertAccountInput) => Effect.Effect<Account[], DbError>
>() {}

export const UpsertAccountsLive = Layer.effect(
  UpsertAccountsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.tryPromise({
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
  }),
);

import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../services/dbClient";
import { accounts, type Account } from "db";
import { sql } from "drizzle-orm";

type UpsertAccountInput = {
  userId: string;
  accounts: { address: string; label: string }[];
};

export class UpsertAccountsService extends Context.Tag("UpsertAccountsService")<
  UpsertAccountsService,
  (
    input: UpsertAccountInput
  ) => Effect.Effect<Account[], DbError, DbClientService>
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
              }))
            )
            .returning()
            .onConflictDoUpdate({
              target: accounts.address,
              set: { label: sql`excluded.label` },
            }),
        catch: (error) => new DbError(error),
      });
  })
);

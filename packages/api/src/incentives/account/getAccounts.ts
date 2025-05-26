import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accounts } from "db/consultation";
import { lte } from "drizzle-orm";

type GetAccountsInput = {
  createdAt: Date;
};

export class GetAccountAddressesService extends Context.Tag(
  "GetAccountAddressesService"
)<
  GetAccountAddressesService,
  (input: GetAccountsInput) => Effect.Effect<string[], DbError, DbClientService>
>() {}

export const GetAccountAddressesLive = Layer.effect(
  GetAccountAddressesService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.tryPromise({
        try: () =>
          db
            .select({ address: accounts.address })
            .from(accounts)
            .where(lte(accounts.createdAt, input.createdAt))
            .then((res) => res.map((r) => r.address)),
        catch: (error) => new DbError(error),
      });
  })
);

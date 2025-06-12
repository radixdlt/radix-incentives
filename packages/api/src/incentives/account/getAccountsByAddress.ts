import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accounts, type Account } from "db/incentives";
import { inArray } from "drizzle-orm";

type GetAccountsByAddressInput = {
  addresses: string[];
};

export class GetAccountsByAddressService extends Context.Tag(
  "GetAccountsByAddressService"
)<
  GetAccountsByAddressService,
  (
    input: GetAccountsByAddressInput
  ) => Effect.Effect<Account[], DbError, DbClientService>
>() {}

export const GetAccountsByAddressLive = Layer.effect(
  GetAccountsByAddressService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(accounts)
            .where(inArray(accounts.address, input.addresses)),

        catch: (error) => new DbError(error),
      });
  })
);

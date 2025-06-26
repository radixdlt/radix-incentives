import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accounts } from "db/consultation";
import { inArray } from "drizzle-orm";

type GetAccountsInput = {
  addresses: string[];
};

export class GetAccountsIntersectionService extends Context.Tag(
  "GetAccountsIntersectionService"
)<
  GetAccountsIntersectionService,
  (input: GetAccountsInput) => Effect.Effect<string[], DbError>
>() {}

export const GetAccountsIntersectionLive = Layer.effect(
  GetAccountsIntersectionService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) => {
      return Effect.gen(function* () {
        return yield* Effect.tryPromise({
          try: () =>
            db
              .select({ address: accounts.address })
              .from(accounts)
              .where(inArray(accounts.address, input.addresses))
              .then((res) => res.map((r) => r.address)),
          catch: (err) => new DbError(err),
        });
      });
    };
  })
);

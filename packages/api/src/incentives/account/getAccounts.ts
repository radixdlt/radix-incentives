import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accounts } from "db/consultation";
import { lte } from "drizzle-orm";

type GetAccountsInput = {
  createdAt: Date;
  columns?: (keyof typeof accounts)[];
};

export class GetAccountAddressesService extends Context.Tag(
  "GetAccountAddressesService"
)<
  GetAccountAddressesService,
  (input: GetAccountsInput) => Effect.Effect<string[] | unknown[], DbError, DbClientService>
>() {}

export const GetAccountAddressesLive = Layer.effect(
  GetAccountAddressesService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.tryPromise({
        try: () => {
          const columns = input.columns && input.columns.length > 0
            ? Object.fromEntries(
                input.columns
                  .filter((col) => accounts[col] !== undefined)
                  .map((col) => [col, accounts[col]])
              )
            : { address: accounts.address, userId: accounts.userId };
          return db
            .select(columns as Record<string, any>)
            .from(accounts)
            .where(lte(accounts.createdAt, input.createdAt))
            .then((res) => {
              if (input.columns && input.columns.length > 0) return res;
              return res.map((r) => ({ address: r.address, userId: r.userId }));
            });
        },
        catch: (error) => new DbError(error),
      });
  })
);

import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accounts } from "db/consultation";
import { inArray } from "drizzle-orm";

type GetAccountsByAddressInput = {
  addresses: string[];
};

export class GetAccountsByAddressService extends Effect.Service<GetAccountsByAddressService>()(
  "GetAccountsByAddressService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* (input: GetAccountsByAddressInput) {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .select()
                .from(accounts)
                .where(inArray(accounts.address, input.addresses)),

            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}

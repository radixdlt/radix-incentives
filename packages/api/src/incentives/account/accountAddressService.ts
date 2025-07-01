import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accounts } from "db/incentives";
import { lte } from "drizzle-orm";

export class AccountAddressService extends Effect.Service<AccountAddressService>()(
  "AccountAddressService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        getPaginated: Effect.fn(function* ({
          offset = 0,
          limit = 10000,
          createdAt,
        }: {
          weekId: string;
          offset: number;
          limit?: number;
          createdAt: Date;
        }) {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .select({ address: accounts.address })
                .from(accounts)
                .where(lte(accounts.createdAt, createdAt))
                .limit(limit)
                .offset(offset)
                .then((res) => res.map((r) => r.address)),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  }
) {}

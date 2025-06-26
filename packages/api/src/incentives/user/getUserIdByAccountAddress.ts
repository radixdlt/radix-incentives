import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accounts } from "db/incentives";
import { inArray } from "drizzle-orm";

type GetAccountsByAddressInput = string[];

type AccountAddress = string;
type UserId = string;

export class GetUserIdByAccountAddressService extends Context.Tag(
  "GetUserIdByAccountAddressService"
)<
  GetUserIdByAccountAddressService,
  (
    input: GetAccountsByAddressInput
  ) => Effect.Effect<Map<AccountAddress, UserId>, DbError>
>() {}

export const GetUserIdByAccountAddressLive = Layer.effect(
  GetUserIdByAccountAddressService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.tryPromise({
        try: () =>
          db
            .select({
              userId: accounts.userId,
              accountAddress: accounts.address,
            })
            .from(accounts)
            .where(inArray(accounts.address, input)),
        catch: (error) => new DbError(error),
      }).pipe(
        Effect.map((result) =>
          result.reduce((acc, curr) => {
            acc.set(curr.accountAddress, curr.userId);
            return acc;
          }, new Map<AccountAddress, UserId>())
        )
      );
  })
);

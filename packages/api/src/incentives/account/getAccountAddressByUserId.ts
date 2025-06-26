import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { accounts } from "db/incentives";
import { inArray } from "drizzle-orm";

type GetAccountAddressByUserIdInput = string[];

type AccountAddress = string;
type UserId = string;

export class GetAccountAddressByUserIdService extends Context.Tag(
  "GetAccountAddressByUserIdService"
)<
  GetAccountAddressByUserIdService,
  (
    input: GetAccountAddressByUserIdInput
  ) => Effect.Effect<Map<UserId, Set<AccountAddress>>, DbError>
>() {}

export const GetAccountAddressByUserIdLive = Layer.effect(
  GetAccountAddressByUserIdService,
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
            .where(inArray(accounts.userId, input)),
        catch: (error) => new DbError(error),
      }).pipe(
        Effect.map((result) => {
          return result.reduce((acc, curr) => {
            const existing = acc.get(curr.userId);
            if (!existing) {
              acc.set(curr.userId, new Set([curr.accountAddress]));
            } else {
              existing.add(curr.accountAddress);
            }

            return acc;
          }, new Map<UserId, Set<AccountAddress>>());
        })
      );
  })
);

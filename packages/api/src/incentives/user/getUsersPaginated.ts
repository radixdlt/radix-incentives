import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import type { Account, User } from "db/incentives";
import { users } from "db/incentives";
import { count } from "drizzle-orm";

type UserWithAccounts = User & {
  accounts: Account[];
};

type GetUsersPaginatedResponse = {
  users: UserWithAccounts[];
  total: number;
};

export class GetUsersPaginatedService extends Context.Tag(
  "GetUsersPaginatedService"
)<
  GetUsersPaginatedService,
  (input: {
    page: number;
    limit: number;
  }) => Effect.Effect<GetUsersPaginatedResponse, DbError, DbClientService>
>() {}

export const GetUsersPaginatedLive = Layer.effect(
  GetUsersPaginatedService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.tryPromise({
        try: async () => {
          // Get the paginated users with accounts
          const paginatedUsers = await db.query.users.findMany({
            with: {
              accounts: true,
            },
            limit: input.limit,
            offset: (input.page - 1) * input.limit,
          });

          // Get the total count of users
          const totalResult = await db.select({ count: count() }).from(users);
          const total = totalResult[0]?.count || 0;

          return {
            users: paginatedUsers,
            total,
          };
        },
        catch: (error) => new DbError(error),
      });
  })
);

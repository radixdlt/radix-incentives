import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

import type { Account, User } from "db/incentives";
import { accounts, users } from "db/incentives";
import { count, desc, inArray } from "drizzle-orm";
import { groupBy } from "effect/Array";

type UserWithAccounts = User & {
  accounts: Account[];
};

type GetUsersPaginatedResponse = {
  users: UserWithAccounts[];
  total: number;
};

export class GetUsersPaginatedService extends Effect.Service<GetUsersPaginatedService>()(
  "GetUsersPaginatedService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return Effect.fn(function* (input: { page: number; limit: number }) {
        // Implementation goes here
        const result: GetUsersPaginatedResponse = yield* Effect.tryPromise({
          try: async () => {
            // Get the total count of users first
            const totalResult = await db.select({ count: count() }).from(users);
            const total = totalResult[0]?.count || 0;

            // Get the paginated users with accounts, sorted by creation date (most recent first)
            const paginatedUsers = await db.query.users.findMany({
              limit: input.limit,
              offset: (input.page - 1) * input.limit,
              orderBy: [desc(users.createdAt)],
            });

            if (paginatedUsers.length === 0) {
              return {
                users: [],
                total,
              };
            }

            const accountsResults = await db.query.accounts.findMany({
              where: inArray(
                accounts.userId,
                paginatedUsers.map((user) => user.id)
              ),
            });

            const accountsByUserId = groupBy(
              accountsResults,
              (account) => account.userId
            );

            const usersWithAccounts = paginatedUsers.map((user) => ({
              ...user,
              accounts: accountsByUserId[user.id] || [],
            }));

            return {
              users: usersWithAccounts,
              total,
            };
          },
          catch: (error) => new DbError(error),
        });

        return result;
      });
    }),
  }
) {}

export const GetUsersPaginatedLive = GetUsersPaginatedService.Default;

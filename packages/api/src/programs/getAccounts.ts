import { Effect } from "effect";
import { DbClientService } from "../services/dbClient";
import { accounts } from "db";
import { eq } from "drizzle-orm";

export const getAccountsProgram = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const result = yield* Effect.tryPromise(() =>
      db.select().from(accounts).where(eq(accounts.userId, userId))
    );

    return result;
  });

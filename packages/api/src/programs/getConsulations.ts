import { Effect } from "effect";
import { DbClientService } from "../services/dbClient";
import { accounts, consultations } from "db";
import { eq } from "drizzle-orm";

export const getConsultationsProgram = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* DbClientService;
    const result = yield* Effect.tryPromise(() =>
      db
        .select({
          consultation: consultations,
        })
        .from(consultations)
        .innerJoin(accounts, eq(consultations.accountAddress, accounts.address))
        .where(eq(accounts.userId, userId))
    );

    return result.map((r) => r.consultation);
  });

import { Effect } from "effect";
import { DbClientService } from "../db/dbClient";
import { accounts, consultations } from "db/consultation";
import { eq } from "drizzle-orm";
import { type Consultation, consultationConfig } from "./consultationConfig";

export class GetConsultationsService extends Effect.Service<GetConsultationsService>()(
  "GetConsultationsService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* (userId: string) {
          const result = yield* Effect.tryPromise(() =>
            db
              .select({
                consultation: consultations,
              })
              .from(consultations)
              .innerJoin(
                accounts,
                eq(consultations.accountAddress, accounts.address)
              )
              .where(eq(accounts.userId, userId))
          );

          return result.map((r) => r.consultation);
        }),
        listConsultations: Effect.fn(function* () {
          return Object.values(consultationConfig)
            .filter((c) => c.endDate > new Date())
            .map((c) => c as Consultation);
        }),
      };
    }),
  }
) {}

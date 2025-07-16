import { Effect } from "effect";
import { DbClientService } from "../db/dbClient";
import { type Consultation, consultations } from "db/consultation";
import { z, type ZodError } from "zod";
import { sql } from "drizzle-orm";

export const consultationEntrySchema = z.object({
  accountAddress: z.string(),
  consultationId: z.string(),
  selectedOption: z.string(),
  rolaProof: z.object({
    publicKey: z.string(),
    signature: z.string(),
    curve: z.enum(["curve25519", "secp256k1"]),
  }),
});

export type ConsultationEntry = Consultation;

export class InsertConsultationError {
  readonly _tag = "InsertConsultationError";
  constructor(readonly error: unknown) {}
}

export class ParseConsultationError {
  readonly _tag = "ParseConsultationError";
  constructor(readonly error: ZodError<ConsultationEntry>) {}
}

export class AddConsultationToDbService extends Effect.Service<AddConsultationToDbService>()(
  "AddConsultationToDbService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* (
          items: z.infer<typeof consultationEntrySchema>[]
        ) {
          yield* Effect.all(
            items.map((item) =>
              Effect.tryPromise({
                try: () => consultationEntrySchema.parseAsync(item),
                catch: (error) =>
                  new ParseConsultationError(
                    error as ZodError<ConsultationEntry>
                  ),
              })
            )
          );

          yield* Effect.tryPromise({
            try: () =>
              db
                .insert(consultations)
                .values(items)
                .onConflictDoUpdate({
                  target: [
                    consultations.consultationId,
                    consultations.accountAddress,
                  ],
                  set: {
                    selectedOption: sql`excluded.selected_option`,
                    rolaProof: sql`excluded.rola_proof`,
                  },
                }),
            catch: (error) => new InsertConsultationError(error),
          });
        }),
      };
    }),
  }
) {}

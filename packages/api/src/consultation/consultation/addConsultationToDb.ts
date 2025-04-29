import { Context, Effect, Layer } from "effect";
import { DbClientService } from "../db/dbClient";
import { consultations } from "db/consultation";
import { z, type ZodError } from "zod";
import { sql } from "drizzle-orm";

export const consultationSchema = z.object({
  accountAddress: z.string(),
  consultationId: z.string(),
  selectedOption: z.string(),
  rolaProof: z.object({
    publicKey: z.string(),
    signature: z.string(),
    curve: z.enum(["curve25519", "secp256k1"]),
  }),
});

export type Consultation = z.infer<typeof consultationSchema>;

export class InsertConsultationError {
  readonly _tag = "InsertConsultationError";
  constructor(readonly error: unknown) {}
}

export class ParseConsultationError {
  readonly _tag = "ParseConsultationError";
  constructor(readonly error: ZodError<Consultation>) {}
}

export class AddConsultationToDbService extends Context.Tag(
  "AddConsultationToDbService"
)<
  AddConsultationToDbService,
  (
    input: Consultation[]
  ) => Effect.Effect<
    null,
    InsertConsultationError | ParseConsultationError,
    DbClientService
  >
>() {}

export const AddConsultationToDbLive = Layer.effect(
  AddConsultationToDbService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (items) => {
      return Effect.gen(function* () {
        yield* Effect.all(
          items.map((item) =>
            Effect.tryPromise({
              try: () => consultationSchema.parseAsync(item),
              catch: (error) =>
                new ParseConsultationError(error as ZodError<Consultation>),
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

        return null;
      });
    };
  })
);

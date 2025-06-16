import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { seasonPointsMultiplier } from "db/incentives";
import { z } from "zod";
import { eq, inArray, and } from "drizzle-orm";

export const GetSeasonPointMultiplierInputSchema = z.object({
  weekId: z.string(),
  userIds: z.array(z.string()).optional(),
});

export type GetSeasonPointMultiplierInput = z.infer<
  typeof GetSeasonPointMultiplierInputSchema
>;

export type GetSeasonPointMultiplierOutput = {
  userId: string;
  multiplier: string;
};

export class GetSeasonPointMultiplierService extends Context.Tag(
  "GetSeasonPointMultiplierService"
)<
  GetSeasonPointMultiplierService,
  (
    input: GetSeasonPointMultiplierInput
  ) => Effect.Effect<GetSeasonPointMultiplierOutput[], DbError, DbClientService>
>() {}

export const GetSeasonPointMultiplierLive = Layer.effect(
  GetSeasonPointMultiplierService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () => {
            const whereConditions = [eq(seasonPointsMultiplier.weekId, input.weekId)];
            
            if (input.userIds && input.userIds.length > 0) {
              whereConditions.push(inArray(seasonPointsMultiplier.userId, input.userIds));
            }

            return db
              .select({
                userId: seasonPointsMultiplier.userId,
                multiplier: seasonPointsMultiplier.multiplier,
              })
              .from(seasonPointsMultiplier)
              .where(and(...whereConditions));
          },
          catch: (error) => new DbError(error),
        });

        return result.map((row) => ({
          userId: row.userId,
          multiplier: row.multiplier,
        }));
      });
  })
);

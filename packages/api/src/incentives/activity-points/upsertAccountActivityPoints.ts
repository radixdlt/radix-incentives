import { Context, Effect, Layer } from 'effect';
import { DbClientService, DbError } from '../db/dbClient';

import { accountActivityPoints, activities } from 'db/incentives';
import { sql, inArray } from 'drizzle-orm';
import { chunker } from '../../common';

export class UpsertAccountActivityPointsService extends Context.Tag(
  'UpsertAccountActivityPointsService',
)<
  UpsertAccountActivityPointsService,
  (
    input: (typeof accountActivityPoints.$inferInsert)[],
  ) => Effect.Effect<void, DbError>
>() {}

export const UpsertAccountActivityPointsLive = Layer.effect(
  UpsertAccountActivityPointsService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return (input) =>
      Effect.gen(function* () {
        // Get unique activity IDs from input
        const uniqueActivityIds = [
          ...new Set(input.map((item) => item.activityId)),
        ];

        // Validate that all activity IDs exist in the activities table
        const validActivityIds = yield* Effect.tryPromise({
          try: async () => {
            const result = await db
              .select({ id: activities.id })
              .from(activities)
              .where(inArray(activities.id, uniqueActivityIds));
            return new Set(result.map((row) => row.id));
          },
          catch: (error) => new DbError(error),
        });

        // Filter input to only include valid activity IDs
        const validInput = input.filter((item) =>
          validActivityIds.has(item.activityId),
        );

        if (validInput.length < input.length) {
          const invalidActivityIds = uniqueActivityIds.filter(
            (id) => !validActivityIds.has(id),
          );
          yield* Effect.log(
            `Filtered out ${input.length - validInput.length} records with invalid activity IDs: ${invalidActivityIds.join(', ')}`,
          );
        }

        if (validInput.length === 0) {
          yield* Effect.log('No valid activity records to upsert');
          return;
        }

        yield* Effect.forEach(chunker(validInput, 10_000), (chunk) => {
          return Effect.gen(function* () {
            yield* Effect.tryPromise({
              try: () =>
                db
                  .insert(accountActivityPoints)
                  .values(chunk)
                  .onConflictDoUpdate({
                    target: [
                      accountActivityPoints.accountAddress,
                      accountActivityPoints.weekId,
                      accountActivityPoints.activityId,
                    ],
                    set: {
                      activityPoints: sql`excluded.activity_points`,
                    },
                  }),
              catch: (error) => new DbError(error),
            });
          });
        }).pipe(Effect.withSpan('upsertAccountActivityPoints'));
      });
  }),
);

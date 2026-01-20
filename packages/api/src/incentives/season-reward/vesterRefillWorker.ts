import { seasons } from 'db/incentives';
import { sql } from 'drizzle-orm';
import { Array as A, Effect, Option, Schema } from 'effect';
import { ComponentAddress, SeasonId } from 'shared/brandedTypes';
import { AccountSchema } from 'shared/schemas/account';
import { DbClientService, dbClientLive } from '../db/dbClient';
import { IncentivesVester } from './incentives-vester/incentivesVester';

const SeasonWithVesterSchema = Schema.Struct({
  id: SeasonId,
  name: Schema.String,
  componentAddress: ComponentAddress,
  adminAccount: AccountSchema,
});

type SeasonWithVester = typeof SeasonWithVesterSchema.Type;

/**
 * Worker service that refills all configured vester components.
 * This is designed to be called periodically (e.g., every 4 hours) via a cron job.
 */
export class VesterRefillWorker extends Effect.Service<VesterRefillWorker>()(
  'VesterRefillWorker',
  {
    dependencies: [IncentivesVester.MainnetLive, dbClientLive],
    effect: Effect.gen(function* () {
      const incentivesVester = yield* IncentivesVester;
      const db = yield* DbClientService;

      /**
       * Gets all seasons that have automatic refill enabled and a vester component configured.
       */
      const getSeasonsWithRefillEnabled = Effect.fn(function* () {
        const results = yield* Effect.tryPromise(() =>
          db
            .select({
              id: seasons.id,
              name: seasons.name,
              config: seasons.config,
            })
            .from(seasons)
            .where(
              sql`${seasons.config}->>'enableAutomaticRefill' = 'true'
                    AND ${seasons.config}->>'seasonRewardComponentAddress' IS NOT NULL`,
            ),
        ).pipe(Effect.orDie);

        return yield* Effect.forEach(
          results,
          (row) =>
            Schema.decodeUnknown(
              Schema.Struct({
                seasonRewardComponentAddress: Schema.optional(
                  Schema.NullOr(ComponentAddress),
                ),
                adminAccount: Schema.optional(Schema.NullOr(AccountSchema)),
              }),
            )(row.config).pipe(
              Effect.map((config) =>
                Option.all({
                  componentAddress: Option.fromNullable(
                    config.seasonRewardComponentAddress,
                  ),
                  adminAccount: Option.fromNullable(config.adminAccount),
                }).pipe(
                  Option.map(
                    ({ componentAddress, adminAccount }): SeasonWithVester => ({
                      id: SeasonId.make(row.id),
                      name: row.name,
                      componentAddress,
                      adminAccount,
                    }),
                  ),
                ),
              ),
              Effect.catchAll(() => Effect.succeed(Option.none())),
            ),
          { concurrency: 'unbounded' },
        ).pipe(Effect.map(A.filterMap((x) => x)));
      });

      /**
       * Refills a single vester component.
       */
      const refillSeason = Effect.fn(function* (season: SeasonWithVester) {
        yield* Effect.log(`Refilling vester for season: ${season.name}`);

        yield* incentivesVester.refill({
          componentAddress: season.componentAddress,
          adminAccount: season.adminAccount,
        });

        yield* Effect.log(
          `Successfully refilled vester for season: ${season.name}`,
        );
      });

      /**
       * Refills all configured vester components that have automatic refill enabled.
       */
      const refillAll = Effect.fn(function* () {
        yield* Effect.log('Starting vester refill job');

        const seasonsWithVester = yield* getSeasonsWithRefillEnabled();

        yield* Effect.log(
          `Found ${seasonsWithVester.length} seasons with automatic refill enabled`,
        );

        let refillCount = 0;

        yield* Effect.forEach(
          seasonsWithVester,
          (season) =>
            refillSeason(season).pipe(
              Effect.tap(() =>
                Effect.sync(() => {
                  refillCount++;
                }),
              ),
              Effect.catchAll((error) =>
                Effect.logError(
                  `Failed to refill vester for season ${season.name}`,
                  { error },
                ),
              ),
            ),
          { concurrency: 1 },
        );

        yield* Effect.log('Vester refill job completed');

        return { refillCount };
      });

      return { refillAll };
    }),
  },
) {}

import { type Season, seasons, weeks } from 'db/incentives';
import { desc, eq, sql } from 'drizzle-orm';
import {
  Array as A,
  Data,
  Effect,
  flow,
  Option,
  Record as R,
  Schema,
} from 'effect';
import {
  ComponentAddress,
  FungibleResourceAddress,
  type SeasonId,
} from 'shared/brandedTypes';
import { AccountSchema } from 'shared/schemas/account';
import { z } from 'zod';
import { DbClientService, DbError, dbClientLive } from '../db/dbClient';
import { BadgeSchema } from '../transaction-intent/schemas';

class NotFound extends Data.TaggedError('NotFound')<{
  message: string;
}> {}

export const CreateSeasonSchema = z.object({
  name: z.string(),
  status: z.enum(['upcoming', 'active', 'completed']),
});

export const EditSeasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['upcoming', 'active', 'completed']),
});

export type EditSeasonInput = z.infer<typeof EditSeasonSchema>;

export const SeasonConfigSchema = Schema.Struct({
  seasonRewardComponentAddress: Schema.NullOr(ComponentAddress),
  adminAccount: Schema.NullOr(AccountSchema),
  rewardsResourceAddress: Schema.NullOr(FungibleResourceAddress),
  adminBadge: Schema.NullOr(BadgeSchema),
});

export type SeasonConfig = typeof SeasonConfigSchema.Type;

export class SeasonService extends Effect.Service<SeasonService>()(
  'SeasonService',
  {
    dependencies: [dbClientLive],
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        getActiveSeason: Effect.fn(function* () {
          const season = yield* Effect.tryPromise({
            try: () =>
              db
                .select({ id: seasons.id })
                .from(seasons)
                .where(eq(seasons.status, 'active'))
                .limit(1)
                .then((result) => result[0]),
            catch: (error) => new DbError(error),
          });

          if (!season) {
            return yield* Effect.fail(
              new NotFound({ message: 'No active season found' }),
            );
          }

          return season;
        }),
        getById: Effect.fn(function* (id: string) {
          const season = yield* Effect.tryPromise({
            try: () =>
              db.query.seasons.findFirst({
                where: eq(seasons.id, id),
              }),
            catch: (error) => new DbError(error),
          });

          if (!season) {
            return yield* Effect.fail(
              new NotFound({ message: `Season ${id} not found` }),
            );
          }

          return season;
        }),
        getByWeekId: Effect.fn(function* (weekId: string) {
          const season = yield* Effect.tryPromise({
            try: () =>
              db.query.weeks
                .findFirst({
                  where: eq(weeks.id, weekId),
                  with: {
                    season: true,
                  },
                })
                .then((result) => result?.season),
            catch: (error) => new DbError(error),
          });

          if (!season) {
            return yield* Effect.fail(
              new NotFound({ message: `Season for week ${weekId} not found` }),
            );
          }

          return season;
        }),
        create: Effect.fn(function* (input: Omit<Season, 'id'>) {
          const season = yield* Effect.tryPromise({
            try: () => db.insert(seasons).values(input).returning(),
            catch: (error) => new DbError(error),
          });

          return season;
        }),
        edit: Effect.fn(function* (input: EditSeasonInput) {
          yield* Effect.tryPromise({
            try: () =>
              db.update(seasons).set(input).where(eq(seasons.id, input.id)),
            catch: (error) => new DbError(error),
          });
        }),
        list: Effect.fn(function* () {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .select({
                  id: seasons.id,
                  name: seasons.name,
                  status: seasons.status,
                  startDate: sql<Date>`MIN(${weeks.startDate})`.as('startDate'),
                  endDate: sql<Date>`MAX(${weeks.endDate})`.as('endDate'),
                })
                .from(seasons)
                .leftJoin(weeks, eq(seasons.id, weeks.seasonId))
                .groupBy(seasons.id, seasons.name, seasons.status)
                .orderBy(desc(sql`MIN(${weeks.startDate})`)),
            catch: (error) => new DbError(error),
          });
        }),
        getConfig: (seasonId: SeasonId) =>
          Effect.tryPromise({
            try: () =>
              db
                .select({ config: seasons.config })
                .from(seasons)
                .where(eq(seasons.id, seasonId)),
            catch: (error) => new DbError(error),
          }).pipe(
            Effect.flatMap(
              flow(
                A.head,
                Option.flatMap(R.get('config')),
                Option.match({
                  onNone: () =>
                    Effect.succeed({
                      seasonRewardComponentAddress: null,
                      adminAccount: null,
                      rewardsResourceAddress: null,
                      adminBadge: null,
                    }),
                  onSome: (config) =>
                    Schema.decodeUnknown(
                      Schema.Struct({
                        seasonRewardComponentAddress: Schema.optional(
                          Schema.NullOr(ComponentAddress),
                        ),
                        adminAccount: Schema.optional(
                          Schema.NullOr(AccountSchema),
                        ),
                        rewardsResourceAddress: Schema.optional(
                          Schema.NullOr(FungibleResourceAddress),
                        ),
                        adminBadge: Schema.optional(Schema.NullOr(BadgeSchema)),
                      }),
                    )(config).pipe(
                      Effect.map((partialConfig) => ({
                        seasonRewardComponentAddress:
                          partialConfig.seasonRewardComponentAddress ?? null,
                        adminAccount: partialConfig.adminAccount ?? null,
                        rewardsResourceAddress:
                          partialConfig.rewardsResourceAddress ?? null,
                        adminBadge: partialConfig.adminBadge ?? null,
                      })),
                    ),
                }),
              ),
            ),
            Effect.orDie,
          ),
        updateConfig: Effect.fn(function* (
          seasonId: SeasonId,
          config: SeasonConfig,
        ) {
          const encodedConfig =
            yield* Schema.encode(SeasonConfigSchema)(config);

          yield* Effect.tryPromise({
            try: () =>
              db
                .update(seasons)
                .set({ config: encodedConfig })
                .where(eq(seasons.id, seasonId)),
            catch: (error) => new DbError(error),
          });
        }),
      };
    }),
  },
) {}

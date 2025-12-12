import { type Db, db, readOnlyDb, type schema } from 'db/incentives';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { Config, Context, Effect, Layer } from 'effect';

export class DbError extends Error {
  _tag = 'DbError';
  constructor(readonly error: unknown) {
    super(error instanceof Error ? error.message : String(error));
  }
}

export class DbClientService extends Context.Tag('DbClientService')<
  DbClientService,
  Db
>() {}

export const dbClientLive = Layer.effect(
  DbClientService,
  Effect.gen(function* () {
    const isTest = yield* Config.boolean('VITEST')
      .pipe(Config.withDefault(false))
      .pipe(Effect.catchTag('ConfigError', Effect.die));

    if (isTest) {
      return yield* Effect.promise(() =>
        import('../../test-helpers/dbTestLive').then((m) => m.dbTestClient),
      );
    }
    return db;
  }),
);

export const dbReadOnlyClientLive = Layer.effect(
  DbClientService,
  Effect.gen(function* () {
    const isTest = yield* Config.boolean('VITEST').pipe(
      Config.withDefault(false),
      Effect.catchTag('ConfigError', Effect.die),
    );

    if (isTest) {
      return yield* Effect.promise(() =>
        import('../../test-helpers/dbTestLive').then((m) => m.dbTestClient),
      );
    }
    return readOnlyDb ?? db;
  }),
);

export const createDbClientLive = (db: Db) =>
  Layer.effect(DbClientService, Effect.succeed(db));

type DatabaseServiceImp = {
  use: <A>(
    f: (db: PostgresJsDatabase<typeof schema>) => Promise<A>,
  ) => Effect.Effect<A, DbError>;
  /**
   * Use the primary database connection, bypassing read replicas.
   * This ensures read-after-write consistency by forcing reads from the primary database.
   */
  usePrimary: <A>(
    f: (db: PostgresJsDatabase<typeof schema>) => Promise<A>,
  ) => Effect.Effect<A, DbError>;
};

export class DbService extends Effect.Service<DbService>()('DbService', {
  dependencies: [dbClientLive],
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;
    return {
      use: (f) =>
        Effect.tryPromise({
          try: () => f(db),
          catch: (error) => new DbError(error),
        }),
      usePrimary: (f) =>
        Effect.tryPromise({
          try: () => {
            const primaryDb = '$primary' in db ? db.$primary : db;
            return f(primaryDb as PostgresJsDatabase<typeof schema>);
          },
          catch: (error) => new DbError(error),
        }),
    } satisfies DatabaseServiceImp;
  }),
}) {}

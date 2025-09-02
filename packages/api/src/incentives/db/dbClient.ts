import { type Db, db, readOnlyDb } from 'db/incentives';
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
    const isTest = yield* Config.boolean('VITEST').pipe(
      Config.withDefault(false),
    );

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

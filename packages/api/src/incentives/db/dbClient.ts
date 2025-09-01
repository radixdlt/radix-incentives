import * as PgDrizzle from '@effect/sql-drizzle/Pg';
import { PgClient } from '@effect/sql-pg';
import type { Db, ReadOnlyDb, schema } from 'db/incentives';
import { Config, Context, Effect, Layer } from 'effect';

const PgLive = PgClient.layerConfig({
  url: Config.redacted('DATABASE_URL'),
});

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

export const createDbClientLive = (db: Db) =>
  Layer.effect(DbClientService, Effect.succeed(db));

export class DbReadOnlyClientService extends Context.Tag(
  'DbReadOnlyClientService',
)<DbReadOnlyClientService, ReadOnlyDb>() {}

export const createDbReadOnlyClientLive = (readOnlyDb: ReadOnlyDb) =>
  Layer.effect(DbReadOnlyClientService, Effect.succeed(readOnlyDb));

export class DrizzleDbService extends Effect.Service<DrizzleDbService>()(
  'DrizzleDbService',
  {
    dependencies: [PgLive],
    effect: Effect.gen(function* () {
      const db = yield* PgDrizzle.make<typeof schema>();
      return db;
    }),
  },
) {}

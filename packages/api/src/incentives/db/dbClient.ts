import { Context, Effect, Layer } from "effect";
import type { Db } from "db/incentives";

export class DbError extends Error {
  _tag = "DbError";
  constructor(readonly error: unknown) {
    super(error instanceof Error ? error.message : String(error));
  }
}

export class DbClientService extends Context.Tag("DbClientService")<
  DbClientService,
  Db
>() {}

export const createDbClientLive = (db: Db) =>
  Layer.effect(DbClientService, Effect.succeed(db));

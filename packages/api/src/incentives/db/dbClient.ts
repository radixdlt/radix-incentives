import { Context, Effect, Layer } from "effect";
import type { Db } from "db/incentives";

export class DbError {
  readonly _tag: "DbError";
  constructor(readonly error: unknown) {
    this._tag = "DbError";
  }
}

export class DbClientService extends Context.Tag("DbClientService")<
  DbClientService,
  Db
>() {}

export const createDbClientLive = (db: Db) =>
  Layer.effect(DbClientService, Effect.succeed(db));

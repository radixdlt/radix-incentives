import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";

export class DappService extends Effect.Service<DappService>()("DappService", {
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;
    return {
      list: Effect.fn(function* () {
        const dapps = yield* Effect.tryPromise({
          try: () => db.query.dapps.findMany(),
          catch: (error) => new DbError(error),
        });
        return dapps;
      }),
    };
  }),
}) {}

import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { z } from "zod";

export const DappSchema = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string(),
});

export type Dapp = z.infer<typeof DappSchema>;

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

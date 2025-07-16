import { Effect } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { type User, user } from "db/consultation";

export class UpsertUserService extends Effect.Service<UpsertUserService>()(
  "UpsertUserService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DbClientService;
      return {
        run: Effect.fn(function* ({
          address,
          label,
        }: {
          address: string;
          label: string;
        }) {
          return yield* Effect.tryPromise({
            try: () =>
              db
                .insert(user)
                .values({ identityAddress: address, label })
                .onConflictDoUpdate({
                  target: [user.identityAddress],
                  set: { label },
                })
                .returning(),
            catch: (error) => new DbError(error),
          }).pipe(Effect.map(([user]) => user as User));
        }),
      };
    }),
  }
) {}

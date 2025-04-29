import { Context, Effect, Layer } from "effect";
import { DbClientService, DbError } from "../db/dbClient";
import { type User, user } from "db/consultation";

export class UpsertUserService extends Context.Tag("UpsertUserService")<
  UpsertUserService,
  (input: {
    address: string;
    label: string;
  }) => Effect.Effect<User, DbError, DbClientService>
>() {}

export const UpsertUserLive = Layer.effect(
  UpsertUserService,
  Effect.gen(function* () {
    const db = yield* DbClientService;

    return ({ address, label }: { address: string; label: string }) =>
      Effect.tryPromise({
        try: () =>
          db
            .insert(user)
            .values({ id: address, label })
            .onConflictDoUpdate({
              target: [user.id],
              set: { label },
            })
            .returning(),
        catch: (error) => new DbError(error),
      }).pipe(Effect.map(([user]) => user as User));
  })
);

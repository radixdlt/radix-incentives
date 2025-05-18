import { Layer, Effect, Context } from "effect";
import { Client } from "pg";

export class LocalDbClientService extends Context.Tag("LocalDbClientService")<
  LocalDbClientService,
  Client
>() {}


export const localDbClientLive = (client: Client) => Layer.effect(
    LocalDbClientService,
    Effect.acquireRelease(
        Effect.sync(() => {
            return client;
        }),
        (client) => Effect.promise(() => client.end())
    )
)
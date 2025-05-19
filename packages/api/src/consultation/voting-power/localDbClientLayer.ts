import { Layer, Effect, Context } from "effect";
import { Client } from "pg";

export class LocalDbClientService extends Context.Tag("LocalDbClientService")<
  LocalDbClientService,
  Client
>() {}


export const localDbClientLive = Layer.effect(
    LocalDbClientService,
    Effect.acquireRelease(
      Effect.promise(() => {
        const client = new Client({
          connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/radix-incentives',
        });
        return client.connect().then(() => client);
      }),
      (client) => Effect.promise(() => client.end())
    )
  );
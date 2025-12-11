import { RedisContainer } from '@testcontainers/redis';
import { Config, Context, Effect, Layer } from 'effect';
import { Redis } from 'ioredis';

export class RedisClientService extends Context.Tag('RedisClientService')<
  RedisClientService,
  Redis
>() {
  static Live = Layer.scoped(
    RedisClientService,
    Effect.gen(function* () {
      const host = yield* Config.string('REDIS_HOST').pipe(Effect.orDie);
      const port = yield* Config.number('REDIS_PORT').pipe(Effect.orDie);
      const password = yield* Config.string('REDIS_PASSWORD').pipe(
        Effect.orDie,
      );

      return yield* Effect.acquireRelease(
        Effect.succeed(
          new Redis({
            host,
            port,
            password,
          }),
        ),
        (client) => Effect.promise(() => client.quit()),
      );
    }),
  );
  static Test = Layer.scoped(
    RedisClientService,
    Effect.gen(function* () {
      const redisContainer = yield* Effect.promise(() =>
        new RedisContainer('redis:7.0').start(),
      );

      const acquire = Effect.succeed(
        new Redis(redisContainer.getConnectionUrl()),
      );

      return yield* Effect.acquireRelease(acquire, (client) =>
        Effect.promise(async () => {
          await client.quit();
          return redisContainer.stop();
        }),
      );
    }),
  );
}

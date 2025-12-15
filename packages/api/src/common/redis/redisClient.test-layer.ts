import { RedisContainer } from '@testcontainers/redis';
import { Effect, Layer } from 'effect';
import { Redis } from 'ioredis';
import { RedisClientService } from './redisClient';

export const RedisClientServiceTest = Layer.scoped(
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

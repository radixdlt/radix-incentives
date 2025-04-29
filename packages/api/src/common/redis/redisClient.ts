import { Context, Effect, Layer } from "effect";
import type { Redis } from "ioredis";

export class RedisClientService extends Context.Tag("RedisClient")<
  RedisClientService,
  Redis
>() {}

export const createRedisClientLive = (redisClient: Redis) =>
  Layer.effect(RedisClientService, Effect.succeed(redisClient));

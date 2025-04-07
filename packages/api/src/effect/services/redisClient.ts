import { Context } from "effect";
import type { Redis } from "ioredis";

export class RedisClient extends Context.Tag("RedisClient")<
  RedisClient,
  Redis
>() {}

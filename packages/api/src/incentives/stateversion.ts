import { Context, Effect, Layer } from "effect";
import type { UnknownException } from "effect/Cause";
import type { Redis } from "ioredis";
import { AppConfigService } from "../consultation/config/appConfig";
import { RedisClientService } from "../common/redis/redisClient";

export const getStateVersion = (stateVersionKey: string, redisClient: Redis) =>
  redisClient.get(stateVersionKey).then((value) => {
    if (value) {
      return Number.parseInt(value);
    }
    return undefined;
  });

export class SetStateVersionService extends Context.Tag("SetStateVersion")<
  SetStateVersionService,
  (value: number) => Effect.Effect<void, UnknownException, never>
>() {}

export const SetStateVersionLive = Layer.effect(
  SetStateVersionService,
  Effect.gen(function* async() {
    const redisClient = yield* RedisClientService;
    const config = yield* AppConfigService;

    return (stateVersion: number) =>
      Effect.tryPromise(() => {
        return redisClient.set(config.stateVersionKey, stateVersion);
      });
  })
);

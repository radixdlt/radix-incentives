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

export const setStateVersion = (
  stateVersionKey: string,
  stateVersion: number,
  redisClient: Redis
) => redisClient.set(stateVersionKey, stateVersion);

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

export class StateVersionNotFoundError {
  readonly _tag = "StateVersionNotFoundError";
}

export class GetStateVersionService extends Context.Tag(
  "GetStateVersionService"
)<
  GetStateVersionService,
  () => Effect.Effect<
    number,
    StateVersionNotFoundError | UnknownException,
    never
  >
>() {}

export const GetStateVersionLive = Layer.effect(
  GetStateVersionService,
  Effect.gen(function* async() {
    const redisClient = yield* RedisClientService;
    const config = yield* AppConfigService;

    return () =>
      Effect.gen(function* () {
        const value = yield* Effect.tryPromise(() => {
          return redisClient.get(config.stateVersionKey);
        });
        if (value) {
          return Number.parseInt(value);
        }
        return yield* Effect.fail(new StateVersionNotFoundError());
      });
  })
);

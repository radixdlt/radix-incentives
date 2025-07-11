import { Context, Effect, Layer } from "effect";

import type { UnknownException } from "effect/Cause";
import { SetStateVersionService } from "../stateversion";

export type StateVersionManager = ReturnType<typeof createStateVersionManager>;

export const createStateVersionManager = (initialStateVersion?: number) => {
  let stateVersion: number | undefined = initialStateVersion;

  return {
    getStateVersion: () => stateVersion,
    setStateVersion: (version: number) => {
      stateVersion = version;
    },
  };
};

export class StateVersionManagerService extends Context.Tag(
  "StateVersionManager"
)<
  StateVersionManagerService,
  {
    getStateVersion: () => Effect.Effect<number | undefined, never, never>;
    setStateVersion: (version: number) => Effect.Effect<void, UnknownException>;
  }
>() {}

export const createStateVersionManagerLive = (
  stateVersionManager: StateVersionManager
) =>
  Layer.effect(
    StateVersionManagerService,
    Effect.gen(function* async() {
      const setStateVersionRedis = yield* SetStateVersionService;

      return {
        getStateVersion: () =>
          Effect.succeed(stateVersionManager.getStateVersion()),
        setStateVersion: (version: number) =>
          Effect.gen(function* () {
            yield* setStateVersionRedis(version);
            stateVersionManager.setStateVersion(version);
          }),
      };
    })
  );

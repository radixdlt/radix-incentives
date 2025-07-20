import { Effect } from "effect";
import { Rola } from "@radixdlt/rola";
import { AppConfigService } from "../config/appConfig";

export class RolaService extends Effect.Service<RolaService>()("RolaService", {
  effect: Effect.gen(function* () {
    const {
      networkId,
      applicationName,
      dAppDefinitionAddress,
      expectedOrigin,
    } = yield* AppConfigService;

    const { verifySignedChallenge } = Rola({
      networkId,
      applicationName,
      dAppDefinitionAddress,
      expectedOrigin,
    });

    yield* Effect.log("rolaConfig", {
      networkId,
      applicationName,
      dAppDefinitionAddress,
      expectedOrigin,
    });

    return {
      run: Effect.fn(function* (
        input: Parameters<typeof verifySignedChallenge>[0]
      ) {
        return yield* Effect.tryPromise(() => verifySignedChallenge(input));
      }),
    };
  }),
}) {}

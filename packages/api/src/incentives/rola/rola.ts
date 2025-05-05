import { Context, Effect, Layer } from "effect";
import { Rola } from "@radixdlt/rola";
import { AppConfigService } from "../config/appConfig";

export class RolaService extends Context.Tag("RolaService")<
  RolaService,
  ReturnType<typeof Rola>["verifySignedChallenge"]
>() {}

export const RolaServiceLive = Layer.effect(
  RolaService,
  Effect.gen(function* () {
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

    return verifySignedChallenge;
  })
);

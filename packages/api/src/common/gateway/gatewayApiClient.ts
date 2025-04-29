import { Context, Effect, Layer } from "effect";
import { AppConfigService } from "../../consultation/config/appConfig";
import { createRadixNetworkClient } from "radix-web3.js";

type GatewayApiClientImpl = ReturnType<typeof createRadixNetworkClient>;

export class GatewayApiClient extends Context.Tag("GatewayApiClient")<
  GatewayApiClient,
  GatewayApiClientImpl
>() {}

export const GatewayApiClientLive = Layer.effect(
  GatewayApiClient,
  Effect.gen(function* () {
    const config = yield* AppConfigService;

    return createRadixNetworkClient({
      networkId: config.networkId,
    });
  }) as Effect.Effect<GatewayApiClientImpl, never, AppConfigService>
);

import { Context, Effect, Layer } from "effect";
import { AppConfigService } from "../../consultation/config/appConfig";
import { createRadixNetworkClient } from "radix-web3.js";

export type GatewayApiClientImpl = ReturnType<typeof createRadixNetworkClient>;

export class GatewayApiClientService extends Context.Tag(
  "GatewayApiClientService"
)<GatewayApiClientService, GatewayApiClientImpl>() {}

export const GatewayApiClientLive = Layer.effect(
  GatewayApiClientService,
  Effect.gen(function* () {
    const config = yield* AppConfigService;

    return createRadixNetworkClient({
      networkId: config.networkId,
    });
  })
);

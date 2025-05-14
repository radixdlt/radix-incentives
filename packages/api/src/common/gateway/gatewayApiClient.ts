import { Context, Effect, Layer } from "effect";
import { AppConfigService } from "../../consultation/config/appConfig";
import { createRadixNetworkClient } from "radix-web3.js";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";

export type GatewayApiClientImpl = ReturnType<typeof createRadixNetworkClient>;

export class GatewayApiClientService extends Context.Tag(
  "GatewayApiClientService"
)<GatewayApiClientService, GatewayApiClientImpl>() {}

export const GatewayApiClientLive = Layer.effect(
  GatewayApiClientService,
  Effect.gen(function* () {
    const config = yield* AppConfigService;

    const gatewayApiClient = GatewayApiClient.initialize({
      networkId: config.networkId,
      applicationName: config.applicationName,
      basePath:
        config.gatewayApiBaseUrl ?? "https://mainnet-gateway.radixdlt.com",
    });

    return createRadixNetworkClient({
      networkId: config.networkId,
      gatewayApiClient,
    });
  })
);

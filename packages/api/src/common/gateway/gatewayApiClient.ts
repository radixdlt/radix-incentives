import { Context, Effect, Layer } from "effect";
import { createRadixNetworkClient } from "radix-web3.js";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";

export type GatewayApiClientImpl = ReturnType<typeof createRadixNetworkClient>;

export class GatewayApiClientService extends Context.Tag(
  "GatewayApiClientService"
)<GatewayApiClientService, GatewayApiClientImpl>() {}

export const GatewayApiClientLive = Layer.effect(
  GatewayApiClientService,
  Effect.gen(function* () {
    const networkId = Number.parseInt(process.env.NETWORK_ID ?? "1");
    const basePath =
      process.env.GATEWAY_URL ?? "https://mainnet-gateway.radixdlt.com";
    const applicationName = process.env.APPLICATION_NAME ?? "";

    const options = {
      networkId,
      applicationName,
      basePath,
    };

    yield* Effect.logDebug("Initializing gateway API client", options);

    const gatewayApiClient = GatewayApiClient.initialize(options);

    return createRadixNetworkClient({
      networkId,
      gatewayApiClient,
    });
  })
);

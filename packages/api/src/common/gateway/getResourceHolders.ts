import { Context, Effect, Layer } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import { GatewayError } from "./errors";
import type { ResourceHoldersResponse } from "@radixdlt/babylon-gateway-api-sdk";

export class GetResourceHoldersService extends Context.Tag(
  "GetResourceHoldersService"
)<
  GetResourceHoldersService,
  (input: {
    resourceAddress: string;
    cursor?: string;
  }) => Effect.Effect<
    ResourceHoldersResponse,
    GatewayError,
    GatewayApiClientService
  >
>() {}

export const GetResourceHoldersLive = Layer.effect(
  GetResourceHoldersService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input) => {
      return Effect.gen(function* () {
        return yield* Effect.tryPromise({
          try: () =>
            gatewayClient.gatewayApiClient.extensions.getResourceHolders(
              input.resourceAddress,
              input.cursor
            ),
          catch: (error) => {
            return new GatewayError(error);
          },
        });
      });
    };
  })
);

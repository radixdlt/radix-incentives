import { Context, Effect, Layer } from "effect";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";
import type { StateNonFungibleDataResponse } from "@radixdlt/babylon-gateway-api-sdk";
import { GatewayError } from "./errors";

type EntityNonFungibleDataParams = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["innerClient"]["nonFungibleData"]
>[0]["stateNonFungibleDataRequest"];

export class EntityNonFungibleDataService extends Context.Tag(
  "EntityNonFungibleDataService"
)<
  EntityNonFungibleDataService,
  (
    input: EntityNonFungibleDataParams
  ) => Effect.Effect<
    StateNonFungibleDataResponse,
    GatewayError,
    GatewayApiClientService
  >
>() {}

export const EntityNonFungibleDataLive = Layer.effect(
  EntityNonFungibleDataService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input) => {
      return Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.gatewayApiClient.state.innerClient.nonFungibleData({
              stateNonFungibleDataRequest: input,
            }),
          catch: (error) => {
            console.log(error, input);
            return new GatewayError(error);
          },
        });

        return result;
      });
    };
  })
);

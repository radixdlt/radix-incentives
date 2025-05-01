import { Context, Effect, Layer } from "effect";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";
import type { StateEntityNonFungiblesPageResponse } from "@radixdlt/babylon-gateway-api-sdk";
import { GatewayError } from "./errors";

type EntityNonFungiblesPageParams = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["innerClient"]["entityNonFungiblesPage"]
>[0]["stateEntityNonFungiblesPageRequest"];

export class EntityNonFungiblesPageService extends Context.Tag(
  "EntityNonFungiblesPageService"
)<
  EntityNonFungiblesPageService,
  (
    input: EntityNonFungiblesPageParams
  ) => Effect.Effect<
    StateEntityNonFungiblesPageResponse,
    GatewayError,
    GatewayApiClientService
  >
>() {}

export const EntityNonFungiblesPageLive = Layer.effect(
  EntityNonFungiblesPageService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input) => {
      return Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.gatewayApiClient.state.innerClient.entityNonFungiblesPage(
              {
                stateEntityNonFungiblesPageRequest: input,
              }
            ),
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

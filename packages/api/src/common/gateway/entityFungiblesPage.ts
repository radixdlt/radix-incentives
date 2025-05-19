import { Context, Effect, Layer } from "effect";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";
import type { StateEntityFungiblesPageResponse } from "@radixdlt/babylon-gateway-api-sdk";
import { GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";

type EntityFungiblesPageParams = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["innerClient"]["entityFungiblesPage"]
>[0]["stateEntityFungiblesPageRequest"];

export class EntityFungiblesPageService extends Context.Tag(
  "EntityFungiblesPageService"
)<
  EntityFungiblesPageService,
  (
    input: Omit<EntityFungiblesPageParams, "at_ledger_state"> & {
      at_ledger_state: AtLedgerState;
    }
  ) => Effect.Effect<
    StateEntityFungiblesPageResponse,
    GatewayError,
    GatewayApiClientService
  >
>() {}

export const EntityFungiblesPageLive = Layer.effect(
  EntityFungiblesPageService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input) => {
      return Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.gatewayApiClient.state.innerClient.entityFungiblesPage(
              {
                stateEntityFungiblesPageRequest: input,
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

import { Context, Effect, Layer } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import { GatewayError } from "./errors";
import type { StateNonFungibleLocationResponse } from "@radixdlt/babylon-gateway-api-sdk";
import type { AtLedgerState } from "./schemas";

export class GetNonFungibleLocationService extends Context.Tag(
  "GetNonFungibleLocationService"
)<
  GetNonFungibleLocationService,
  (input: {
    resourceAddress: string;
    nonFungibleIds: string[];
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<
    StateNonFungibleLocationResponse,
    GatewayError,
    GatewayApiClientService
  >
>() {}

export const GetNonFungibleLocationLive = Layer.effect(
  GetNonFungibleLocationService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input) => {
      return Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.gatewayApiClient.state.innerClient.nonFungibleLocation(
              {
                stateNonFungibleLocationRequest: {
                  resource_address: input.resourceAddress,
                  non_fungible_ids: input.nonFungibleIds,
                  at_ledger_state: input.at_ledger_state,
                },
              }
            ),
          catch: (error) => new GatewayError(error),
        });

        return result;
      });
    };
  })
);

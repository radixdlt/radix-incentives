import { Effect } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import { GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";

export class GetNonFungibleLocationService extends Effect.Service<GetNonFungibleLocationService>()(
  "GetNonFungibleLocationService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      return Effect.fn(function* (input: {
        resourceAddress: string;
        nonFungibleIds: string[];
        at_ledger_state: AtLedgerState;
      }) {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.state.innerClient.nonFungibleLocation({
              stateNonFungibleLocationRequest: {
                resource_address: input.resourceAddress,
                non_fungible_ids: input.nonFungibleIds,
                at_ledger_state: input.at_ledger_state,
              },
            }),
          catch: (error) => new GatewayError({ error }),
        });

        return result;
      });
    }),
  }
) {}

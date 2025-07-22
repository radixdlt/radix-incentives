import { Effect } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import type { EntityFungiblesPageRequest } from "@radixdlt/babylon-gateway-api-sdk";
import { GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";

export class EntityFungiblesPageService extends Effect.Service<EntityFungiblesPageService>()(
  "EntityFungiblesPageService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;

      return Effect.fn(function* (
        input: Omit<
          EntityFungiblesPageRequest["stateEntityFungiblesPageRequest"],
          "at_ledger_state"
        > & {
          at_ledger_state: AtLedgerState;
        }
      ) {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.state.innerClient.entityFungiblesPage({
              stateEntityFungiblesPageRequest: input,
            }),
          catch: (error) => new GatewayError({ error }),
        });

        return result;
      });
    }),
  }
) {}

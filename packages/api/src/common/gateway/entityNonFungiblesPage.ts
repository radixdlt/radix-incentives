import { Effect } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import type { EntityNonFungiblesPageRequest } from "@radixdlt/babylon-gateway-api-sdk";
import { GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";

export class EntityNonFungiblesPageService extends Effect.Service<EntityNonFungiblesPageService>()(
  "EntityNonFungiblesPageService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      return Effect.fn(function* (
        input: Omit<
          EntityNonFungiblesPageRequest["stateEntityNonFungiblesPageRequest"],
          "at_ledger_state"
        > & {
          at_ledger_state: AtLedgerState;
        }
      ) {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.state.innerClient.entityNonFungiblesPage({
              stateEntityNonFungiblesPageRequest: input,
            }),
          catch: (error) => new GatewayError({ error }),
        });

        return result;
      });
    }),
  }
) {}

import { Effect } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import type { StateKeyValueStoreDataRequest } from "@radixdlt/babylon-gateway-api-sdk";
import { GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";

export class KeyValueStoreDataService extends Effect.Service<KeyValueStoreDataService>()(
  "KeyValueStoreDataService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;

      return Effect.fn(function* (
        input: Omit<StateKeyValueStoreDataRequest, "at_ledger_state"> & {
          at_ledger_state: AtLedgerState;
        }
      ) {
        return yield* Effect.tryPromise({
          try: () =>
            gatewayClient.state.innerClient.keyValueStoreData({
              stateKeyValueStoreDataRequest: input,
            }),
          catch: (error) => new GatewayError({ error }),
        });
      });
    }),
  }
) {}

import { Data, Effect } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import type { StateKeyValueStoreKeysRequest } from "@radixdlt/babylon-gateway-api-sdk";
import { GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";

class EntityNotFoundError extends Data.TaggedError("EntityNotFoundError") {}

export class KeyValueStoreKeysService extends Effect.Service<KeyValueStoreKeysService>()(
  "KeyValueStoreKeysService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;

      return Effect.fn(function* (
        input: Omit<StateKeyValueStoreKeysRequest, "at_ledger_state"> & {
          at_ledger_state: AtLedgerState;
        }
      ) {
        return yield* Effect.tryPromise({
          try: () =>
            gatewayClient.state.innerClient.keyValueStoreKeys({
              stateKeyValueStoreKeysRequest: input,
            }),
          catch: (error) => {
            if (error instanceof Error && error.message.includes("404")) {
              return new EntityNotFoundError();
            }
            return new GatewayError({ error });
          },
        });
      });
    }),
  }
) {}

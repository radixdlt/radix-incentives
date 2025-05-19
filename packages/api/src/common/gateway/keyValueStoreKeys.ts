import { Context, Effect, Layer } from "effect";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";
import type { StateKeyValueStoreKeysResponse } from "@radixdlt/babylon-gateway-api-sdk";
import { EntityNotFoundError, GatewayError } from "./errors";
import type { AtLedgerState } from "./schemas";

type KeyValueStoreKeysParams = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["innerClient"]["keyValueStoreKeys"]
>[0]["stateKeyValueStoreKeysRequest"];

export class KeyValueStoreKeysService extends Context.Tag(
  "KeyValueStoreKeysService"
)<
  KeyValueStoreKeysService,
  (
    input: Omit<KeyValueStoreKeysParams, "at_ledger_state"> & {
      at_ledger_state: AtLedgerState;
    }
  ) => Effect.Effect<
    StateKeyValueStoreKeysResponse,
    GatewayError | EntityNotFoundError,
    GatewayApiClientService
  >
>() {}

export const KeyValueStoreKeysLive = Layer.effect(
  KeyValueStoreKeysService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input) => {
      return Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.gatewayApiClient.state.innerClient.keyValueStoreKeys({
              stateKeyValueStoreKeysRequest: input,
            }),
          catch: (error) => {
            if (error instanceof Error && error.message.includes("404")) {
              return new EntityNotFoundError(error);
            }

            return new GatewayError(error);
          },
        });

        return result;
      });
    };
  })
);

import { Context, Effect, Layer } from "effect";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";
import type { StateKeyValueStoreDataResponse } from "@radixdlt/babylon-gateway-api-sdk";
import { GatewayError } from "./errors";
import type { GatewayError as GatewayErrorType } from "@radixdlt/babylon-gateway-api-sdk";
import type { AtLedgerState } from "./schemas";

type KeyValueStoreDataParams = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["innerClient"]["keyValueStoreData"]
>[0]["stateKeyValueStoreDataRequest"];

export class KeyValueStoreDataService extends Context.Tag(
  "KeyValueStoreDataService"
)<
  KeyValueStoreDataService,
  (
    input: Omit<KeyValueStoreDataParams, "at_ledger_state"> & {
      at_ledger_state: AtLedgerState;
    }
  ) => Effect.Effect<
    StateKeyValueStoreDataResponse,
    GatewayError,
    GatewayApiClientService
  >
>() {}

export const KeyValueStoreDataLive = Layer.effect(
  KeyValueStoreDataService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input) => {
      return Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.gatewayApiClient.state.innerClient.keyValueStoreData({
              stateKeyValueStoreDataRequest: input,
            }),
          catch: (error) => {
            console.log(error, input);
            return new GatewayError(error as GatewayErrorType);
          },
        });

        return result;
      });
    };
  })
);

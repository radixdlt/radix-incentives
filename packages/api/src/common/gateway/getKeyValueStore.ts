import { Context, Effect, Layer } from "effect";
import type { GatewayApiClientService } from "./gatewayApiClient";
import { KeyValueStoreKeysService } from "./keyValueStoreKeys";
import type { EntityNotFoundError, GatewayError } from "./errors";
import { KeyValueStoreDataService } from "./keyValueStoreData";
import type { StateKeyValueStoreDataResponse } from "@radixdlt/babylon-gateway-api-sdk";
import type { AtLedgerState } from "./schemas";

export class GetKeyValueStoreService extends Context.Tag(
  "GetKeyValueStoreService"
)<
  GetKeyValueStoreService,
  (input: {
    address: string;
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<
    StateKeyValueStoreDataResponse,
    GatewayError | EntityNotFoundError,
    | KeyValueStoreKeysService
    | KeyValueStoreDataService
    | GatewayApiClientService
  >
>() {}

export const GetKeyValueStoreLive = Layer.effect(
  GetKeyValueStoreService,
  Effect.gen(function* () {
    const keyValueStoreKeysService = yield* KeyValueStoreKeysService;
    const keyValueStoreDataService = yield* KeyValueStoreDataService;

    return (input) => {
      return Effect.gen(function* () {
        const keyResults = yield* keyValueStoreKeysService({
          key_value_store_address: input.address,
          at_ledger_state: input.at_ledger_state,
        });

        const allKeys = [...keyResults.items];

        let nextCursor = keyResults.next_cursor;

        while (nextCursor) {
          const nextKeyResults = yield* keyValueStoreKeysService({
            key_value_store_address: input.address,
            at_ledger_state: input.at_ledger_state,
            cursor: nextCursor,
          });

          allKeys.push(...nextKeyResults.items);

          nextCursor = nextKeyResults.next_cursor;
        }

        const data = yield* keyValueStoreDataService({
          key_value_store_address: input.address,
          keys: allKeys.map(({ key }) => ({
            key_json: key.programmatic_json,
          })),
          at_ledger_state: input.at_ledger_state,
        });

        return data;
      });
    };
  })
);

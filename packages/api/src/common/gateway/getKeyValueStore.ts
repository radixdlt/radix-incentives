import { Effect } from "effect";
import { KeyValueStoreKeysService } from "./keyValueStoreKeys";
import { KeyValueStoreDataService } from "./keyValueStoreData";
import type { AtLedgerState } from "./schemas";
import { chunker } from "../helpers/chunker";

export class GetKeyValueStoreService extends Effect.Service<GetKeyValueStoreService>()(
  "GetKeyValueStoreService",
  {
    effect: Effect.gen(function* () {
      const keyValueStoreKeysService = yield* KeyValueStoreKeysService;
      const keyValueStoreDataService = yield* KeyValueStoreDataService;
      return Effect.fn(function* (input: {
        address: string;
        at_ledger_state: AtLedgerState;
      }) {
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

        const batchSize = 100;

        const chunks = chunker(allKeys, batchSize);

        return yield* Effect.forEach(chunks, (keys) => {
          return Effect.gen(function* () {
            const data = yield* keyValueStoreDataService({
              key_value_store_address: input.address,
              keys: keys.map(({ key }) => ({
                key_json: key.programmatic_json,
              })),
              at_ledger_state: input.at_ledger_state,
            });

            return data;
          });
        }).pipe(
          Effect.map((res) => {
            const { key_value_store_address, ledger_state } = res[0]!;
            const entries = res.flatMap((item) => item.entries);
            return {
              key_value_store_address,
              ledger_state,
              entries,
            };
          })
        );
      });
    }),
  }
) {}

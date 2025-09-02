import { Effect } from 'effect';
import { KeyValueStoreDataService } from './keyValueStoreData';
import { KeyValueStoreKeysService } from './keyValueStoreKeys';
import type { AtLedgerState } from './schemas';

export class GetKeyValueStoreService extends Effect.Service<GetKeyValueStoreService>()(
  'GetKeyValueStoreService',
  {
    dependencies: [
      KeyValueStoreKeysService.Default,
      KeyValueStoreDataService.Default,
    ],
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

        return yield* keyValueStoreDataService({
          key_value_store_address: input.address,
          keys: allKeys.map(({ key }) => ({
            key_json: key.programmatic_json,
          })),
          at_ledger_state: input.at_ledger_state,
        }).pipe(
          Effect.map((res) => {
            const { key_value_store_address, ledger_state } = res[0]!;
            const entries = res.flatMap((item) => item.entries);
            return {
              key_value_store_address,
              ledger_state,
              entries,
            };
          }),
        );
      });
    }),
  },
) {}

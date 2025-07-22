import { Effect } from "effect";

import type { AtLedgerState } from "../../gateway/schemas";
import { GetKeyValueStoreService } from "../../gateway/getKeyValueStore";
import s from "sbor-ez-mode";

import { I192 } from "../../helpers/i192";

export class FailedToParseComponentStateError {
  readonly _tag = "FailedToParseComponentStateError";
  constructor(readonly error: unknown) {}
}

const binMapKeyValueStoreKeySchema = s.tuple([s.number()]);

const binMapKeyValueStoreValueSchema = s.struct({
  amount: s.decimal(),
  total_claim: s.decimal(),
});

export type GetQuantaSwapBinMapServiceOutput = Map<
  number,
  { amount: I192; total_claim: I192 }
>;

export class GetQuantaSwapBinMapService extends Effect.Service<GetQuantaSwapBinMapService>()(
  "GetQuantaSwapBinMapService",
  {
    effect: Effect.gen(function* () {
      const getKeyValueStoreService = yield* GetKeyValueStoreService;
      return Effect.fn(function* (input: {
        address: string;
        at_ledger_state: AtLedgerState;
      }) {
        const keyValueStore = yield* getKeyValueStoreService({
          address: input.address,
          at_ledger_state: input.at_ledger_state,
        });

        const binData = yield* Effect.forEach(keyValueStore.entries, (entry) =>
          Effect.gen(function* () {
            const parsedKey = binMapKeyValueStoreKeySchema.safeParse(
              entry.key.programmatic_json
            );
            const parsedValue = binMapKeyValueStoreValueSchema.safeParse(
              entry.value.programmatic_json
            );

            if (parsedKey.isErr()) {
              return yield* Effect.fail(
                new FailedToParseComponentStateError(parsedKey.error)
              );
            }

            if (parsedValue.isErr()) {
              return yield* Effect.fail(
                new FailedToParseComponentStateError(parsedValue.error)
              );
            }

            const key = parsedKey.value[0];
            const value = parsedValue.value;

            return { key, value };
          })
        ).pipe(
          Effect.map((items) =>
            items.reduce<Map<number, { amount: I192; total_claim: I192 }>>(
              (acc, { key, value: { amount, total_claim } }) => {
                acc.set(key, {
                  amount: new I192(amount),
                  total_claim: new I192(total_claim),
                });
                return acc;
              },
              new Map<number, { amount: I192; total_claim: I192 }>()
            )
          )
        );

        return binData;
      });
    }),
  }
) {}

export const GetQuantaSwapBinMapLive = GetQuantaSwapBinMapService.Default;

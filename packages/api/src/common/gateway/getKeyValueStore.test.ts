import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "./gatewayApiClient";
import { GetKeyValueStoreService } from "./getKeyValueStore";
import { KeyValueStoreDataService } from "./keyValueStoreData";
import { KeyValueStoreKeysService } from "./keyValueStoreKeys";
import { it } from "@effect/vitest";

const gatewayApiClientLive = GatewayApiClientLive;

const keyValueStoreDataServiceLive = KeyValueStoreDataService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const keyValueStoreKeysServiceLive = KeyValueStoreKeysService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreServiceLive = GetKeyValueStoreService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
);

describe("GetKeyValueStoreService", () => {
  it.effect(
    "should get key value store",
    Effect.fn(function* () {
      const getKeyValueStore = yield* Effect.provide(
        GetKeyValueStoreService,
        getKeyValueStoreServiceLive
      );

      const result = yield* getKeyValueStore({
        address:
          "internal_keyvaluestore_rdx1kzjr763caq96j0kv883vy8gnf3jvrrp7dfm9zr5n0akryvzsxvyujc",
        at_ledger_state: {
          timestamp: new Date("2025-01-01T00:00:00.000Z"),
        },
      });

      expect(result.entries.length).toBeGreaterThan(0);

      // console.log(JSON.stringify(result, null, 2));
    })
  );
});

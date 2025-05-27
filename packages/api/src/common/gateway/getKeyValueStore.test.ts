import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "./gatewayApiClient";
import { GetEntityDetailsServiceLive } from "./getEntityDetails";
import { GetLedgerStateLive } from "./getLedgerState";
import { GetFungibleBalanceLive } from "./getFungibleBalance";
import { EntityFungiblesPageLive } from "./entityFungiblesPage";
import {
  GetKeyValueStoreLive,
  GetKeyValueStoreService,
} from "./getKeyValueStore";
import { KeyValueStoreDataLive } from "./keyValueStoreData";
import { KeyValueStoreKeysLive } from "./keyValueStoreKeys";

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getLedgerStateLive = GetLedgerStateLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const stateEntityDetailsLive = GetFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const keyValueStoreDataServiceLive = KeyValueStoreDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const keyValueStoreKeysServiceLive = KeyValueStoreKeysLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getKeyValueStoreServiceLive = GetKeyValueStoreLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
);

describe("GetKeyValueStoreService", () => {
  it("should get key value store", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getKeyValueStore = yield* GetKeyValueStoreService;

        return yield* getKeyValueStore({
          address:
            "internal_keyvaluestore_rdx1kzjr763caq96j0kv883vy8gnf3jvrrp7dfm9zr5n0akryvzsxvyujc",
          at_ledger_state: {
            timestamp: new Date("2025-01-01T00:00:00.000Z"),
          },
        });
      }),
      Layer.mergeAll(
        gatewayApiClientLive,
        getKeyValueStoreServiceLive,
        keyValueStoreDataServiceLive,
        keyValueStoreKeysServiceLive
      )
    );

    const result = await Effect.runPromise(program);

    console.log(JSON.stringify(result, null, 2));
  });
});

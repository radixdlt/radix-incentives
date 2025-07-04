import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { GetLedgerStateLive } from "../../gateway/getLedgerState";
import { EntityFungiblesPageLive } from "../../gateway/entityFungiblesPage";
import { GetNonFungibleBalanceLive } from "../../gateway/getNonFungibleBalance";
import { EntityNonFungiblesPageLive } from "../../gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataLive } from "../../gateway/entityNonFungiblesData";
import {
  GetWeftFinancePositionsLive,
  GetWeftFinancePositionsService,
} from "./getWeftFinancePositions";
import { GetFungibleBalanceLive } from "../../gateway/getFungibleBalance";
import { GetComponentStateLive } from "../../gateway/getComponentState";
import { GetKeyValueStoreLive } from "../../gateway/getKeyValueStore";
import { KeyValueStoreDataLive } from "../../gateway/keyValueStoreData";
import { KeyValueStoreKeysLive } from "../../gateway/keyValueStoreKeys";
import { GetNftResourceManagersLive } from "../../gateway/getNftResourceManagers";
import { GetNonFungibleIdsLive } from "../../gateway/getNonFungibleIds";

// Provide all dependencies in correct order, EntityNonFungiblesPageLive only once
const fullLayer = GetWeftFinancePositionsLive.pipe(
  Layer.provide(
    GetNonFungibleBalanceLive.pipe(
      Layer.provide(
        GetEntityDetailsServiceLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(GatewayApiClientLive),
      Layer.provide(
        EntityFungiblesPageLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(
        EntityNonFungiblesPageLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(
        EntityNonFungibleDataLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(
        GetLedgerStateLive.pipe(Layer.provide(GatewayApiClientLive))
      )
    )
  ),
  Layer.provide(
    EntityFungiblesPageLive.pipe(Layer.provide(GatewayApiClientLive))
  ),
  Layer.provide(
    GetFungibleBalanceLive.pipe(
      Layer.provide(
        GetEntityDetailsServiceLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(GatewayApiClientLive),
      Layer.provide(
        EntityFungiblesPageLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(
        GetLedgerStateLive.pipe(Layer.provide(GatewayApiClientLive))
      )
    )
  ),
  Layer.provide(
    GetEntityDetailsServiceLive.pipe(Layer.provide(GatewayApiClientLive))
  ),
  Layer.provide(
    GetComponentStateLive.pipe(
      Layer.provide(
        GetEntityDetailsServiceLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(GatewayApiClientLive)
    )
  ),
  Layer.provide(
    GetKeyValueStoreLive.pipe(
      Layer.provide(GatewayApiClientLive),
      Layer.provide(
        KeyValueStoreDataLive.pipe(Layer.provide(GatewayApiClientLive))
      ),
      Layer.provide(
        KeyValueStoreKeysLive.pipe(Layer.provide(GatewayApiClientLive))
      )
    )
  ),
  Layer.provide(GetNftResourceManagersLive),
  Layer.provide(GetNonFungibleIdsLive),
  Layer.provide(
    EntityNonFungibleDataLive.pipe(Layer.provide(GatewayApiClientLive))
  ),
  Layer.provide(
    KeyValueStoreDataLive.pipe(Layer.provide(GatewayApiClientLive))
  ),
  Layer.provide(
    KeyValueStoreKeysLive.pipe(Layer.provide(GatewayApiClientLive))
  ),
  Layer.provide(GatewayApiClientLive),
  Layer.provide(GetLedgerStateLive.pipe(Layer.provide(GatewayApiClientLive))),
  Layer.provide(
    EntityNonFungiblesPageLive.pipe(Layer.provide(GatewayApiClientLive))
  ) // Only once
);

const program = Effect.provide(
  Effect.gen(function* () {
    const getWeftFinancePositions = yield* GetWeftFinancePositionsService;
    return yield* getWeftFinancePositions({
      accountAddresses: [
        "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew",
      ],
      at_ledger_state: {
        state_version: 322574776,
      },
    });
  }),
  fullLayer
);

describe("GetWeftFinancePositionsService", () => {
  it("should get weft finance positions", async () => {
    const result = await Effect.runPromise(program);
    console.log(JSON.stringify(result, null, 2));
  });
});

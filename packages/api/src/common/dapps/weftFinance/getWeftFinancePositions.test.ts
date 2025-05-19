import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { createAppConfigLive } from "../../config/appConfig";
import { LoggerLive } from "../../logger/logger";
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

const appConfigServiceLive = createAppConfigLive();

const loggerLive = LoggerLive.pipe(Layer.provide(appConfigServiceLive));

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive),
  Layer.provide(appConfigServiceLive)
);

const getLedgerStateLive = GetLedgerStateLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungiblesPageServiceLive = EntityNonFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungibleDataServiceLive = EntityNonFungibleDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getFungibleBalanceLive = GetFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getComponentStateServiceLive = GetComponentStateLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(appConfigServiceLive)
);

const keyValueStoreDataServiceLive = KeyValueStoreDataLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

const keyValueStoreKeysServiceLive = KeyValueStoreKeysLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

const getKeyValueStoreServiceLive = GetKeyValueStoreLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive),
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
);

const getWeftFinancePositionsLive = GetWeftFinancePositionsLive.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(getComponentStateServiceLive),
  Layer.provide(getKeyValueStoreServiceLive)
);

describe("GetWeftFinancePositionsService", () => {
  it("should get weft finance positions", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getWeftFinancePositions = yield* GetWeftFinancePositionsService;

        return yield* getWeftFinancePositions({
          accountAddresses: [
            "account_rdx12xwrtgmq68wqng0d69qx2j627ld2dnfufdklkex5fuuhc8eaeltq2k",
          ],
          at_ledger_state: {
            timestamp: new Date(),
          },
        });
      }),
      Layer.mergeAll(
        getWeftFinancePositionsLive,
        loggerLive,
        gatewayApiClientLive,
        getNonFungibleBalanceLive,
        entityFungiblesPageServiceLive,
        entityNonFungiblesPageServiceLive,
        getLedgerStateLive,
        getEntityDetailsServiceLive,
        getFungibleBalanceLive,
        getComponentStateServiceLive,
        getKeyValueStoreServiceLive,
        keyValueStoreDataServiceLive,
        keyValueStoreKeysServiceLive
      )
    );

    const result = await Effect.runPromise(program);

    console.log(JSON.stringify(result, null, 2));
  });
});

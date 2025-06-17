import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { GetLedgerStateLive } from "../../gateway/getLedgerState";

import { EntityFungiblesPageLive } from "../../gateway/entityFungiblesPage";

import {
  GetRootFinancePositionsService,
  GetRootFinancePositionsLive,
} from "./getRootFinancePositions";
import { GetNonFungibleBalanceLive } from "../../gateway/getNonFungibleBalance";
import { EntityNonFungiblesPageLive } from "../../gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataLive } from "../../gateway/entityNonFungiblesData";
import { KeyValueStoreDataLive } from "../../gateway/keyValueStoreData";
import { KeyValueStoreKeysLive } from "../../gateway/keyValueStoreKeys";
import { GetKeyValueStoreLive } from "../../gateway/getKeyValueStore";
import { GetNftResourceManagersLive } from "../../gateway/getNftResourceManagers";
import { GetNonFungibleIdsLive } from "../../gateway/getNonFungibleIds";

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

const entityNonFungiblesPageServiceLive = EntityNonFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungibleDataServiceLive = EntityNonFungibleDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
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

const getNonFungibleIdsLive = GetNonFungibleIdsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive)
);

const getNftResourceManagersLive = GetNftResourceManagersLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleIdsLive)
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(getNftResourceManagersLive)
);

const getRootFinancePositionLive = GetRootFinancePositionsLive.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getKeyValueStoreServiceLive),
  Layer.provide(keyValueStoreDataServiceLive),
  Layer.provide(keyValueStoreKeysServiceLive)
);

describe("GetRootFinancePositionService", () => {
  it("should get root finance position", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getRootFinancePositions = yield* GetRootFinancePositionsService;

        const result = yield* getRootFinancePositions({
          accountAddresses: [
            "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew",
          ],
          at_ledger_state: {
            timestamp: new Date(),
          },
        });

        console.log("Root Finance Positions for account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew:");
        console.log(JSON.stringify(result, null, 2));
        
        return result;
      }),
      Layer.mergeAll(
        getRootFinancePositionLive,
        gatewayApiClientLive,
        getNonFungibleBalanceLive,
        entityFungiblesPageServiceLive,
        entityNonFungiblesPageServiceLive,
        getLedgerStateLive,
        getKeyValueStoreServiceLive,
        keyValueStoreDataServiceLive,
        keyValueStoreKeysServiceLive,
        getEntityDetailsServiceLive,
        entityNonFungibleDataServiceLive,
        getNftResourceManagersLive,
        getNonFungibleIdsLive
      )
    );

    try {
      const result = await Effect.runPromise(program);
      console.log("Test completed successfully");
      console.log("Final result:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Effect execution error:", error);
      
      // Try to extract more useful error information
      if (error && typeof error === 'object') {
        if (error.cause) {
          console.error("Error cause:", error.cause);
        }
        if (error._tag) {
          console.error("Error tag:", error._tag);
        }
      }
      
      throw error;
    }
  });
});

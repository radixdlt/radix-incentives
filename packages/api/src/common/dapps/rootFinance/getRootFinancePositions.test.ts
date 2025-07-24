import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsService } from "../../gateway/getEntityDetails";
import { GetLedgerStateService } from "../../gateway/getLedgerState";

import { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";

import { GetRootFinancePositionsService } from "./getRootFinancePositions";
import { GetNonFungibleBalanceService } from "../../gateway/getNonFungibleBalance";
import { EntityNonFungiblesPageService } from "../../gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataService } from "../../gateway/entityNonFungiblesData";
import { KeyValueStoreDataService } from "../../gateway/keyValueStoreData";
import { KeyValueStoreKeysService } from "../../gateway/keyValueStoreKeys";
import { GetKeyValueStoreService } from "../../gateway/getKeyValueStore";
import { GetNftResourceManagersService } from "../../gateway/getNftResourceManagers";
import { GetNonFungibleIdsService } from "../../gateway/getNonFungibleIds";

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getLedgerStateLive = GetLedgerStateService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungiblesPageServiceLive =
  EntityNonFungiblesPageService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

const entityNonFungibleDataServiceLive =
  EntityNonFungibleDataService.Default.pipe(
    Layer.provide(gatewayApiClientLive)
  );

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

const getNonFungibleIdsLive = GetNonFungibleIdsService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive)
);

const getNftResourceManagersLive = GetNftResourceManagersService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getNonFungibleIdsLive)
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getLedgerStateLive),
  Layer.provide(getNftResourceManagersLive)
);

const getRootFinancePositionLive = GetRootFinancePositionsService.Default.pipe(
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

        const result = yield* getRootFinancePositions.run({
          accountAddresses: [
            "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew",
          ],
          at_ledger_state: {
            timestamp: new Date(),
          },
        });

        return result;
      }),
      getRootFinancePositionLive
    );

    const result = await Effect.runPromise(program);

    expect(result).toBeDefined();
  });
});

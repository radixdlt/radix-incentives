import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { createAppConfigLive } from "../../config/appConfig";
import { LoggerLive } from "../../logger/logger";
import {
  GetLedgerStateLive,
  GetLedgerStateService,
} from "../../gateway/getLedgerState";

import { EntityFungiblesPageLive } from "../../gateway/entityFungiblesPage";

import {
  GetRootFinancePositionsService,
  GetRootFinancePositionsLive,
} from "./getRootFinancePositions";
import { GetNonFungibleBalanceLive } from "../../gateway/getNonFungibleBalance";
import { EntityNonFungiblesPageLive } from "../../gateway/entityNonFungiblesPage";
import { EntityNonFungibleDataLive } from "../../gateway/entityNonFungiblesData";

const appConfigServiceLive = createAppConfigLive();

const loggerLive = LoggerLive.pipe(Layer.provide(appConfigServiceLive));

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

// const getStateVersionLive = GetStateVersionLive.pipe(
//   Layer.provide(gatewayApiClientLive)
// );

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

const getNonFungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(entityNonFungiblesPageServiceLive),
  Layer.provide(entityNonFungibleDataServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getRootFinancePositionLive = GetRootFinancePositionsLive.pipe(
  Layer.provide(getNonFungibleBalanceLive),
  Layer.provide(entityNonFungiblesPageServiceLive)
);

describe("GetRootFinancePositionService", () => {
  it("should get root finance position", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getRootFinancePositions = yield* GetRootFinancePositionsService;
        // const getStateVersion = yield* GetStateVersionService;

        // const stateVersion = yield* getStateVersion(
        //   new Date("2025-04-01T00:00:00.000Z")
        // );

        return yield* getRootFinancePositions({
          accountAddresses: [
            "account_rdx16xqpkw4lujmuuyt6hdqgjutdlu0d7kqlqc8sxsxyhtveq84stmh28g",
          ],
          stateVersion: {
            timestamp: new Date(),
          },
        });
      }),
      Layer.mergeAll(
        getRootFinancePositionLive,
        loggerLive,
        gatewayApiClientLive,
        getNonFungibleBalanceLive,
        entityFungiblesPageServiceLive,
        entityNonFungiblesPageServiceLive,
        getLedgerStateLive
      )
    );

    const result = await Effect.runPromise(program);

    console.log(JSON.stringify(result, null, 2));
  });
});

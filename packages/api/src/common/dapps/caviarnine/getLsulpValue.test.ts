import { Effect, Layer } from "effect";

import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsService } from "../../gateway/getEntityDetails";
import { GetLedgerStateService } from "../../gateway/getLedgerState";
import { GetFungibleBalanceService } from "../../gateway/getFungibleBalance";
import { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";
import { GetLsulpValueLive, GetLsulpValueService } from "./getLsulpValue";

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

const getFungibleBalanceLive = GetFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const getLsulpValueLive = GetLsulpValueLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getLedgerStateLive)
);

describe("GetLsulpValueService", () => {
  it("should get lsulp value", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getLsulpValue = yield* GetLsulpValueService;
        const getLedgerState = yield* GetLedgerStateService;

        const state = yield* getLedgerState({
          // timestamp: new Date("2025-04-01T00:00:00.000Z"),
          at_ledger_state: {
            state_version: 286058118,
          },
        });

        console.log(JSON.stringify(state, null, 2));

        return yield* getLsulpValue({
          at_ledger_state: {
            state_version: state.state_version,
          },
        });
      }),
      Layer.mergeAll(
        gatewayApiClientLive,
        getFungibleBalanceLive,
        entityFungiblesPageServiceLive,
        getLedgerStateLive,
        getLsulpValueLive
      )
    );

    const result = await Effect.runPromise(program);

    console.log(result);
  });
});

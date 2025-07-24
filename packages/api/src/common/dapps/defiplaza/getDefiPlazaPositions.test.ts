import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsService } from "../../gateway/getEntityDetails";
import { GetLedgerStateService } from "../../gateway/getLedgerState";

import { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";

import {
  GetDefiPlazaPositionsLive,
  GetDefiPlazaPositionsService,
} from "./getDefiPlazaPositions";
import { GetFungibleBalanceService } from "../../gateway/getFungibleBalance";
import { GetResourcePoolUnitsLive } from "../../resource-pool/getResourcePoolUnits";

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

const getResourcePoolUnitsServiceLive = GetResourcePoolUnitsLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive)
);

const getDefiPlazaPositionsLive = GetDefiPlazaPositionsLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive),

  Layer.provide(getResourcePoolUnitsServiceLive),
  Layer.provide(entityFungiblesPageServiceLive)
);

describe("GetDefiPlazaPositionsService", () => {
  it("should get defi plaza positions", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getDefiPlazaPositions = yield* GetDefiPlazaPositionsService;

        return yield* getDefiPlazaPositions({
          accountAddresses: [
            // contains xUSDC BaseLP tokens
            "account_rdx12x2a5dft0gszufcce98ersqvsd8qr5kzku968jd50n8w4qyl9awecr",
          ],
          at_ledger_state: {
            timestamp: new Date("2025-06-17T00:00:00Z"),
          },
        });
      }),
      Layer.mergeAll(
        getDefiPlazaPositionsLive,
        gatewayApiClientLive,
        getLedgerStateLive,
        getEntityDetailsServiceLive,
        getFungibleBalanceLive,
        getResourcePoolUnitsServiceLive,
        entityFungiblesPageServiceLive
      )
    );

    const [result] = await Effect.runPromise(program);

    expect(result.items.length).toBeGreaterThan(0);
  }, 30_000);
});

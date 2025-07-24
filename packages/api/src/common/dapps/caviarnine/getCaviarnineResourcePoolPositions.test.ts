import { describe, it } from "vitest";
import { Effect, Layer } from "effect";
import {
  GetCaviarnineResourcePoolPositionsLive,
  GetCaviarnineResourcePoolPositionsService,
} from "./getCaviarnineResourcePoolPositions";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsService } from "../../gateway/getEntityDetails";
import { GetFungibleBalanceService } from "../../gateway/getFungibleBalance";
import { GetResourcePoolUnitsLive } from "../../resource-pool/getResourcePoolUnits";
import { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";

const TEST_ACCOUNT =
  "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew";

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageService.Default.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getFungibleBalanceLive = GetFungibleBalanceService.Default.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive)
);

const getResourcePoolUnitsLive = GetResourcePoolUnitsLive.pipe(
  Layer.provide(getFungibleBalanceLive),
  Layer.provide(getEntityDetailsServiceLive)
);

const getCaviarnineResourcePoolPositionsLive =
  GetCaviarnineResourcePoolPositionsLive.pipe(
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getResourcePoolUnitsLive)
  );

describe("getCaviarnineResourcePoolPositions", () => {
  it("should fetch SimplePool positions without errors", async () => {
    const program = Effect.gen(function* () {
      const service = yield* GetCaviarnineResourcePoolPositionsService;

      const result = yield* service.run({
        addresses: [TEST_ACCOUNT],
        at_ledger_state: { state_version: 329748623 },
      });

      return result;
    });

    await Effect.runPromise(
      Effect.provide(program, getCaviarnineResourcePoolPositionsLive)
    );
  });
});

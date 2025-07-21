import { describe, it } from "vitest";
import { Effect, Layer } from "effect";
import {
  GetCaviarnineResourcePoolPositionsLive,
  GetCaviarnineResourcePoolPositionsService,
} from "./getCaviarnineResourcePoolPositions";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { GetFungibleBalanceLive } from "../../gateway/getFungibleBalance";
import { GetResourcePoolUnitsLive } from "../../resource-pool/getResourcePoolUnits";
import { EntityFungiblesPageLive } from "../../gateway/entityFungiblesPage";

const TEST_ACCOUNT =
  "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew";

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getFungibleBalanceLive = GetFungibleBalanceLive.pipe(
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

      console.log(
        "Caviarnine SimplePool positions result:",
        JSON.stringify(result, null, 2)
      );
      return result;
    });

    await Effect.runPromise(
      Effect.provide(program, getCaviarnineResourcePoolPositionsLive)
    );
  });

  it("should handle empty results gracefully", async () => {
    const program = Effect.gen(function* () {
      const service = yield* GetCaviarnineResourcePoolPositionsService;

      const result = yield* service.run({
        addresses: [
          "account_rdx1000000000000000000000000000000000000000000000000000000",
        ],
        at_ledger_state: { state_version: 329748623 },
      });

      console.log("Empty result:", JSON.stringify(result, null, 2));
      return result;
    });

    await Effect.runPromise(
      Effect.provide(program, getCaviarnineResourcePoolPositionsLive)
    );
  });
});

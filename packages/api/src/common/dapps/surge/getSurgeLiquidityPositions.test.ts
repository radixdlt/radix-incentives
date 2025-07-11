import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { GetLedgerStateLive } from "../../gateway/getLedgerState";
import { EntityFungiblesPageLive } from "../../gateway/entityFungiblesPage";
import {
  GetSurgeLiquidityPositionsLive,
  GetSurgeLiquidityPositionsService,
} from "./getSurgeLiquidityPositions";
import { GetFungibleBalanceLive } from "../../gateway/getFungibleBalance";
import { GetComponentStateLive } from "../../gateway/getComponentState";

const fullLayer = GetSurgeLiquidityPositionsLive.pipe(
  Layer.provide(GetFungibleBalanceLive),
  Layer.provide(GetComponentStateLive),
  Layer.provide(GetEntityDetailsServiceLive),
  Layer.provide(EntityFungiblesPageLive),
  Layer.provide(GetLedgerStateLive),
  Layer.provide(GatewayApiClientLive)
);

describe("GetSurgeLiquidityPositionsService", () => {
  it("should get surge liquidity positions", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* GetSurgeLiquidityPositionsService;
        return yield* service.getSurgeLiquidityPositions({
          accountAddresses: [
            "account_rdx12x7dulvhrvz2ney3992n5y4y590cqj58ge5y2xesjlkzgrydg8xdd7",
          ],
          at_ledger_state: { state_version: 325927555 },
        });
      }).pipe(Effect.provide(fullLayer))
    );

    console.log("=== Surge Liquidity Positions ===");
    console.log(JSON.stringify(result, null, 2));
  });
});

import { Effect, Exit, Layer } from "effect";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { GetEntityDetailsService } from "../../gateway/getEntityDetails";
import { GetLedgerStateService } from "../../gateway/getLedgerState";
import { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";
import {
  GetSurgeLiquidityPositionsLive,
  GetSurgeLiquidityPositionsService,
} from "./getSurgeLiquidityPositions";
import { GetFungibleBalanceService } from "../../gateway/getFungibleBalance";
import { GetComponentStateService } from "../../gateway/getComponentState";

const GetFungibleBalanceLive = GetFungibleBalanceService.Default;
const GetComponentStateLive = GetComponentStateService.Default;
const GetEntityDetailsServiceLive = GetEntityDetailsService.Default;
const EntityFungiblesPageLive = EntityFungiblesPageService.Default;
const GetLedgerStateLive = GetLedgerStateService.Default;

const getSurgeLiquidityPositionsLive = GetSurgeLiquidityPositionsLive.pipe(
  Layer.provide(GetFungibleBalanceLive),
  Layer.provide(GetComponentStateLive),
  Layer.provide(GetEntityDetailsServiceLive),
  Layer.provide(EntityFungiblesPageLive),
  Layer.provide(GetLedgerStateLive),
  Layer.provide(GatewayApiClientLive)
);

describe("GetSurgeLiquidityPositionsService", () => {
  it("should get surge liquidity positions", async () => {
    const result = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const service = yield* GetSurgeLiquidityPositionsService;
        return yield* service.getSurgeLiquidityPositions({
          accountAddresses: [
            "account_rdx12x7dulvhrvz2ney3992n5y4y590cqj58ge5y2xesjlkzgrydg8xdd7",
          ],
          at_ledger_state: { state_version: 325927555 },
        });
      }).pipe(Effect.provide(getSurgeLiquidityPositionsLive))
    );

    Exit.match(result, {
      onSuccess: (value) => {
        expect(value.length).toBeGreaterThan(0);
      },
      onFailure: (error) => {
        console.error(JSON.stringify(error, null, 2));
      },
    });
  });
});

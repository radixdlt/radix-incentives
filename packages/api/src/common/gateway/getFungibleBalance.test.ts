import { Effect, Exit, Layer } from "effect";
import { GatewayApiClientLive } from "./gatewayApiClient";
import { GetEntityDetailsService } from "./getEntityDetails";

import { GetLedgerStateService } from "./getLedgerState";
import { GetFungibleBalanceService } from "./getFungibleBalance";
import { EntityFungiblesPageService } from "./entityFungiblesPage";

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

const stateEntityDetailsLive = GetFungibleBalanceService.Default.pipe(
  Layer.provide(getEntityDetailsServiceLive),

  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getLedgerStateLive)
);

const ACCOUNT_ADDRESSES = [
  "account_rdx12yvpng9r5u3ggqqfwva0u6vya3hjrd6jantdq72p0jm6qarg8lld2f",
  "account_rdx1cx26ckdep9t0lut3qaz3q8cj9wey3tdee0rdxhc5f0nce64lw5gt70",
  "account_rdx168nr5dwmll4k2x5apegw5dhrpejf3xac7khjhgjqyg4qddj9tg9v4d",
  "account_rdx168fjn9fcts5h59k3z64acp8xszz8sf2a66hnw050vdnkurullz9rge",
];

describe("GetFungibleBalanceService", () => {
  it("should get account balance", async () => {
    const runnable = Effect.provide(
      Effect.gen(function* () {
        const getFungibleBalance = yield* GetFungibleBalanceService;
        const getLedgerState = yield* GetLedgerStateService;

        const ledgerState = yield* getLedgerState({
          at_ledger_state: {
            timestamp: new Date("2025-04-31T00:00:00.000Z"),
          },
        });

        return yield* getFungibleBalance({
          addresses: ACCOUNT_ADDRESSES,
          options: {
            native_resource_details: true,
          },
          at_ledger_state: {
            state_version: ledgerState.state_version,
          },
        });
      }),
      Layer.merge(stateEntityDetailsLive, getLedgerStateLive)
    );

    const result = await Effect.runPromiseExit(runnable);

    const value = Exit.match(result, {
      onSuccess: (value) => {
        return value;
      },
      onFailure: (error) => {
        console.error(JSON.stringify(error, null, 2));
        throw error;
      },
    });
    expect(value.length).toBeGreaterThan(0);
  });
});

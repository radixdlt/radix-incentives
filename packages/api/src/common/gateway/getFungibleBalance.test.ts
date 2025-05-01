import { Effect, Layer } from "effect";
import { GatewayApiClientLive } from "./gatewayApiClient";
import { GetEntityDetailsServiceLive } from "./getEntityDetails";
import { createAppConfigLive } from "../config/appConfig";
import { LoggerLive } from "../logger/logger";
import { GetStateVersionLive } from "./getStateVersion";
import {
  GetFungibleBalanceService,
  GetFungibleBalanceLive,
} from "./getFungibleBalance";
import { EntityFungiblesPageLive } from "./entityFungiblesPage";

const appConfigServiceLive = createAppConfigLive();

const loggerLive = LoggerLive.pipe(Layer.provide(appConfigServiceLive));

const gatewayApiClientLive = GatewayApiClientLive.pipe(
  Layer.provide(appConfigServiceLive)
);

const getEntityDetailsServiceLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(loggerLive)
);

const getStateVersionLive = GetStateVersionLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityFungiblesPageServiceLive = EntityFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const stateEntityDetailsLive = GetFungibleBalanceLive.pipe(
  Layer.provide(getEntityDetailsServiceLive),
  Layer.provide(loggerLive),
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityFungiblesPageServiceLive),
  Layer.provide(getStateVersionLive)
);

const ACCOUNT_ADDRESSES = [
  "account_rdx12yvpng9r5u3ggqqfwva0u6vya3hjrd6jantdq72p0jm6qarg8lld2f",
  "account_rdx1cx26ckdep9t0lut3qaz3q8cj9wey3tdee0rdxhc5f0nce64lw5gt70",
  "account_rdx168nr5dwmll4k2x5apegw5dhrpejf3xac7khjhgjqyg4qddj9tg9v4d",
  "account_rdx168fjn9fcts5h59k3z64acp8xszz8sf2a66hnw050vdnkurullz9rge",
];

describe("GetFungibleBalanceService", () => {
  it("should get account balance", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getFungibleBalance = yield* GetFungibleBalanceService;

        return yield* getFungibleBalance({
          addresses: ACCOUNT_ADDRESSES,
          options: {
            native_resource_details: true,
          },
          state: {
            timestamp: new Date("2025-04-31T00:00:00.000Z"),
          },
        });
      }),
      Layer.mergeAll(
        gatewayApiClientLive,
        loggerLive,
        stateEntityDetailsLive,
        entityFungiblesPageServiceLive,
        getStateVersionLive
      )
    );

    const result = await Effect.runPromise(program);

    for (const account of result) {
      console.log(
        account.address,
        `${account.fungibleResources.length} fungible resources`
      );
    }
  });
});

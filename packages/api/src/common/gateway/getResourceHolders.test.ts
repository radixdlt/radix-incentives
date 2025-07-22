import { Effect, Layer } from "effect";
import { GetResourceHoldersService } from "./getResourceHolders";
import { GatewayApiClientLive } from "./gatewayApiClient";
import { it } from "@effect/vitest";

describe("getResourceHolders", () => {
  it.effect(
    "should get the resource holders",
    Effect.fn(function* () {
      const getResourceHolders = yield* Effect.provide(
        GetResourceHoldersService,
        GetResourceHoldersService.Default.pipe(
          Layer.provide(GatewayApiClientLive)
        )
      );

      const result = yield* getResourceHolders({
        resourceAddress:
          "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
      });

      console.log(JSON.stringify(result, null, 2));
    })
  );
});

import { Effect, Layer } from "effect";
import { GetResourceHoldersService, GetResourceHoldersLive } from "./getResourceHolders";
import { GatewayApiClientLive } from "./gatewayApiClient";

describe("getResourceHolders", () => {
  it("should get the resource holders", async () => {
    const program = Effect.gen(function* () {
      const getResourceHolders = yield* GetResourceHoldersService;

      const result = yield* getResourceHolders({
        resourceAddress: "resource_rdx1ntzhjg985wgpkhda9f9q05xqdj8xuggfw0j5u3zxudk2csv82d0089",
      });

      return result;
    });

    const result = await Effect.runPromise(
      Effect.provide(
        program,
        Layer.mergeAll(
          GatewayApiClientLive,
          GetResourceHoldersLive.pipe(Layer.provide(GatewayApiClientLive))
        )
      )
    );

    console.log(JSON.stringify(result, null, 2));
  });
});
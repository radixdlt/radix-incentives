import { Effect, Layer } from "effect";
import { describe, it, expect } from "vitest";
import {
  GetOciswapResourcePoolPositionsService,
  GetOciswapResourcePoolPositionsLive,
} from "./getOciswapResourcePoolPositions";
import { GetFungibleBalanceLive } from "../../gateway/getFungibleBalance";
import { GetResourcePoolUnitsLive } from "../../resource-pool/getResourcePoolUnits";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { EntityFungiblesPageLive } from "../../gateway/entityFungiblesPage";

// Test configuration
const TEST_ACCOUNT_ADDRESS =
  "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew";
const TEST_STATE_VERSION = 328823647;

// Create a test layer that provides all dependencies
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

const getOciswapResourcePoolPositionsLive =
  GetOciswapResourcePoolPositionsLive.pipe(
    Layer.provide(getFungibleBalanceLive),
    Layer.provide(getResourcePoolUnitsLive)
  );

const testLayer = getOciswapResourcePoolPositionsLive;

describe("GetOciswapResourcePoolPositionsService", () => {
  it("should fetch FlexPool positions correctly", async () => {
    const program = Effect.gen(function* () {
      const service = yield* GetOciswapResourcePoolPositionsService;

      const result = yield* service.run({
        accountAddresses: [TEST_ACCOUNT_ADDRESS],
        at_ledger_state: { state_version: TEST_STATE_VERSION },
        poolType: "flexPools",
      });

      return result;
    });

    const result = await Effect.runPromise(Effect.provide(program, testLayer));

    // Verify the structure
    expect(Array.isArray(result)).toBe(true);

    // Each result should have pool and result properties
    for (const poolData of result) {
      expect(poolData).toHaveProperty("pool");
      expect(poolData).toHaveProperty("result");
      expect(Array.isArray(poolData.result)).toBe(true);

      // Each result should have address and items
      for (const accountData of poolData.result) {
        expect(accountData).toHaveProperty("address");
        expect(accountData).toHaveProperty("items");
        expect(Array.isArray(accountData.items)).toBe(true);

        // If there are items, they should have the correct structure
        for (const item of accountData.items) {
          expect(item).toHaveProperty("xToken");
          expect(item).toHaveProperty("yToken");
          expect(item).toHaveProperty("isActive");

          expect(item.xToken).toHaveProperty("totalAmount");
          expect(item.xToken).toHaveProperty("amountInBounds");
          expect(item.xToken).toHaveProperty("resourceAddress");

          expect(item.yToken).toHaveProperty("totalAmount");
          expect(item.yToken).toHaveProperty("amountInBounds");
          expect(item.yToken).toHaveProperty("resourceAddress");
        }
      }
    }

    console.log("FlexPool positions result:", JSON.stringify(result, null, 2));
  });

  it("should fetch BasicPool positions correctly", async () => {
    const program = Effect.gen(function* () {
      const service = yield* GetOciswapResourcePoolPositionsService;

      const result = yield* service.run({
        accountAddresses: [TEST_ACCOUNT_ADDRESS],
        at_ledger_state: { state_version: TEST_STATE_VERSION },
        poolType: "basicPools",
      });

      return result;
    });

    const result = await Effect.runPromise(Effect.provide(program, testLayer));

    // Verify the structure (same as FlexPools)
    expect(Array.isArray(result)).toBe(true);

    for (const poolData of result) {
      expect(poolData).toHaveProperty("pool");
      expect(poolData).toHaveProperty("result");
      expect(Array.isArray(poolData.result)).toBe(true);

      for (const accountData of poolData.result) {
        expect(accountData).toHaveProperty("address");
        expect(accountData).toHaveProperty("items");
        expect(Array.isArray(accountData.items)).toBe(true);

        for (const item of accountData.items) {
          expect(item).toHaveProperty("xToken");
          expect(item).toHaveProperty("yToken");
          expect(item).toHaveProperty("isActive");

          expect(item.xToken).toHaveProperty("totalAmount");
          expect(item.xToken).toHaveProperty("amountInBounds");
          expect(item.xToken).toHaveProperty("resourceAddress");

          expect(item.yToken).toHaveProperty("totalAmount");
          expect(item.yToken).toHaveProperty("amountInBounds");
          expect(item.yToken).toHaveProperty("resourceAddress");
        }
      }
    }

    console.log("BasicPool positions result:", JSON.stringify(result, null, 2));
  });

  it("should handle empty results gracefully", async () => {
    const program = Effect.gen(function* () {
      const service = yield* GetOciswapResourcePoolPositionsService;

      // Test with an account that likely has no positions
      const result = yield* service.run({
        accountAddresses: [
          "account_rdx12y528ccdmqge0dgw9ce3vg30vyhax5ynpwakvzafrzzg69texgpe60",
        ], // Example empty account
        at_ledger_state: { state_version: 328823647 },
        poolType: "flexPools",
      });

      return result;
    });

    const result = await Effect.runPromise(Effect.provide(program, testLayer));

    // Should still return proper structure even with no positions
    expect(Array.isArray(result)).toBe(true);

    for (const poolData of result) {
      expect(poolData).toHaveProperty("pool");
      expect(poolData).toHaveProperty("result");
      expect(Array.isArray(poolData.result)).toBe(true);

      // Should have one result per account address, even if empty
      expect(poolData.result).toHaveLength(1);
      expect(poolData.result[0].items).toHaveLength(0);
    }
  });
});

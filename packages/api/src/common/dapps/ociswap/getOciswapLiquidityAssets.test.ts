import { describe, it } from "vitest";
import { Effect, Layer } from "effect";
import {
  GetOciswapLiquidityAssetsLive,
  GetOciswapLiquidityAssetsService,
} from "./getOciswapLiquidityAssets";
import {
  GetOciswapLiquidityClaimsLive,
  GetOciswapLiquidityClaimsService,
} from "./getOciswapLiquidityClaims";
import { GatewayApiClientLive } from "../../gateway/gatewayApiClient";
import { EntityNonFungibleDataLive } from "../../gateway/entityNonFungiblesData";
import { GetComponentStateLive } from "../../gateway/getComponentState";
import { GetNonFungibleBalanceLive } from "../../gateway/getNonFungibleBalance";
import { GetNftResourceManagersLive } from "../../gateway/getNftResourceManagers";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { EntityNonFungiblesPageLive } from "../../gateway/entityNonFungiblesPage";
import { GetNonFungibleIdsLive } from "../../gateway/getNonFungibleIds";

const TEST_CONFIG = {
  // Pool component address
  componentAddress:
    "component_rdx1cz8daq5nwmtdju4hj5rxud0ta26wf90sdk5r4nj9fqjcde5eht8p0f",

  // LP NFT resource address for this pool
  lpResourceAddress:
    "resource_rdx1nflrqd24a8xqelasygwlt6dhrgtu3akky695kk6j3cy4wu0wfn2ef8",

  // Token addresses
  tokenXAddress:
    "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
  tokenYAddress:
    "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",

  // Token divisibilities
  tokenXDivisibility: 18,
  tokenYDivisibility: 18,

  // Test user address that holds LP NFTs
  userAddress:
    "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew",

  // Specific NFT ID to test
  nftId: "#435#",

  // Price bounds for testing
  priceBounds: {
    lower: 0.8, // 80% of current price
    upper: 1.2, // 120% of current price
  },

  // Alternative tight bounds for testing
  tightPriceBounds: {
    lower: 0.95, // 95% of current price
    upper: 1.05, // 105% of current price
  },

  // Wide bounds for testing
  widePriceBounds: {
    lower: 0.5, // 50% of current price
    upper: 2.0, // 200% of current price
  },
};

const gatewayApiClientLive = GatewayApiClientLive;

const getEntityDetailsLive = GetEntityDetailsServiceLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungibleDataLive = EntityNonFungibleDataLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const entityNonFungiblesPageLive = EntityNonFungiblesPageLive.pipe(
  Layer.provide(gatewayApiClientLive)
);

const getNonFungibleIdsLive = GetNonFungibleIdsLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungibleDataLive)
);

const getNftResourceManagersLive = GetNftResourceManagersLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungiblesPageLive),
  Layer.provide(entityNonFungibleDataLive),
  Layer.provide(getNonFungibleIdsLive)
);

const getComponentStateLive = GetComponentStateLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(getEntityDetailsLive)
);

const getNonFungibleBalanceLive = GetNonFungibleBalanceLive.pipe(
  Layer.provide(gatewayApiClientLive),
  Layer.provide(entityNonFungibleDataLive),
  Layer.provide(entityNonFungiblesPageLive),
  Layer.provide(getNftResourceManagersLive),
  Layer.provide(getNonFungibleIdsLive)
);

const getOciswapLiquidityClaimsLive = GetOciswapLiquidityClaimsLive.pipe(
  Layer.provide(entityNonFungibleDataLive)
);

const getOciswapLiquidityAssetsLive = GetOciswapLiquidityAssetsLive.pipe(
  Layer.provide(getComponentStateLive),
  Layer.provide(getOciswapLiquidityClaimsLive),
  Layer.provide(getNonFungibleBalanceLive)
);

const TestLive = Layer.mergeAll(
  gatewayApiClientLive,
  getEntityDetailsLive,
  entityNonFungibleDataLive,
  entityNonFungiblesPageLive,
  getNonFungibleIdsLive,
  getNftResourceManagersLive,
  getComponentStateLive,
  getNonFungibleBalanceLive,
  getOciswapLiquidityClaimsLive,
  getOciswapLiquidityAssetsLive
);

describe("OciSwap Liquidity Assets Test", () => {
  it("should calculate liquidity assets with normal price bounds", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getOciswapLiquidityAssetsService =
          yield* GetOciswapLiquidityAssetsService;

        const result = yield* getOciswapLiquidityAssetsService({
          componentAddress: TEST_CONFIG.componentAddress,
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 321803265 },
          lpResourceAddress: TEST_CONFIG.lpResourceAddress,
          tokenXAddress: TEST_CONFIG.tokenXAddress,
          tokenYAddress: TEST_CONFIG.tokenYAddress,
          tokenXDivisibility: TEST_CONFIG.tokenXDivisibility,
          tokenYDivisibility: TEST_CONFIG.tokenYDivisibility,
          priceBounds: TEST_CONFIG.priceBounds,
        });

        console.log("=== NORMAL PRICE BOUNDS TEST ===");
        console.log("Price bounds:", TEST_CONFIG.priceBounds);
        console.log("Result:", JSON.stringify(result, null, 2));

        // Show comparison clearly
        if (result.length > 0 && result[0].items.length > 0) {
          const item = result[0].items[0];
          console.log("\n--- COMPARISON ---");
          console.log(`X Token (${item.xToken.resourceAddress}):`);
          console.log(`  Total: ${item.xToken.totalAmount}`);
          console.log(`  In bounds: ${item.xToken.amountInBounds}`);
          console.log(`Y Token (${item.yToken.resourceAddress}):`);
          console.log(`  Total: ${item.yToken.totalAmount}`);
          console.log(`  In bounds: ${item.yToken.amountInBounds}`);
          console.log(`Active: ${item.isActive}`);
        }

        return result;
      }),
      TestLive
    );

    // @ts-ignore - Ignoring type errors to test functionality
    const result = await Effect.runPromise(program);
    console.log("Normal bounds result:", result);
  });

  it("should calculate liquidity assets with tight price bounds", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getOciswapLiquidityAssetsService =
          yield* GetOciswapLiquidityAssetsService;

        const result = yield* getOciswapLiquidityAssetsService({
          componentAddress: TEST_CONFIG.componentAddress,
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 321803265 },
          lpResourceAddress: TEST_CONFIG.lpResourceAddress,
          tokenXAddress: TEST_CONFIG.tokenXAddress,
          tokenYAddress: TEST_CONFIG.tokenYAddress,
          tokenXDivisibility: TEST_CONFIG.tokenXDivisibility,
          tokenYDivisibility: TEST_CONFIG.tokenYDivisibility,
          priceBounds: TEST_CONFIG.tightPriceBounds,
        });

        console.log("=== TIGHT PRICE BOUNDS TEST ===");
        console.log("Price bounds:", TEST_CONFIG.tightPriceBounds);
        console.log("Result:", JSON.stringify(result, null, 2));

        // Show comparison clearly
        if (result.length > 0 && result[0].items.length > 0) {
          const item = result[0].items[0];
          console.log("\n--- COMPARISON ---");
          console.log(`X Token (${item.xToken.resourceAddress}):`);
          console.log(`  Total: ${item.xToken.totalAmount}`);
          console.log(`  In bounds: ${item.xToken.amountInBounds}`);
          console.log(`Y Token (${item.yToken.resourceAddress}):`);
          console.log(`  Total: ${item.yToken.totalAmount}`);
          console.log(`  In bounds: ${item.yToken.amountInBounds}`);
          console.log(`Active: ${item.isActive}`);
        }

        return result;
      }),
      TestLive
    );

    // @ts-ignore - Ignoring type errors to test functionality
    const result = await Effect.runPromise(program);
    console.log("Tight bounds result:", result);
  });

  it("should calculate liquidity assets with wide price bounds", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getOciswapLiquidityAssetsService =
          yield* GetOciswapLiquidityAssetsService;

        const result = yield* getOciswapLiquidityAssetsService({
          componentAddress: TEST_CONFIG.componentAddress,
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 321803265 },
          lpResourceAddress: TEST_CONFIG.lpResourceAddress,
          tokenXAddress: TEST_CONFIG.tokenXAddress,
          tokenYAddress: TEST_CONFIG.tokenYAddress,
          tokenXDivisibility: TEST_CONFIG.tokenXDivisibility,
          tokenYDivisibility: TEST_CONFIG.tokenYDivisibility,
          priceBounds: TEST_CONFIG.widePriceBounds,
        });

        console.log("=== WIDE PRICE BOUNDS TEST ===");
        console.log("Price bounds:", TEST_CONFIG.widePriceBounds);
        console.log("Result:", JSON.stringify(result, null, 2));

        // Show comparison clearly
        if (result.length > 0 && result[0].items.length > 0) {
          const item = result[0].items[0];
          console.log("\n--- COMPARISON ---");
          console.log(`X Token (${item.xToken.resourceAddress}):`);
          console.log(`  Total: ${item.xToken.totalAmount}`);
          console.log(`  In bounds: ${item.xToken.amountInBounds}`);
          console.log(`Y Token (${item.yToken.resourceAddress}):`);
          console.log(`  Total: ${item.yToken.totalAmount}`);
          console.log(`  In bounds: ${item.yToken.amountInBounds}`);
          console.log(`Active: ${item.isActive}`);
        }

        return result;
      }),
      TestLive
    );

    // @ts-ignore - Ignoring type errors to test functionality
    const result = await Effect.runPromise(program);
    console.log("Wide bounds result:", result);
  });

  it("should show position details for debugging", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getOciswapLiquidityClaimsService =
          yield* GetOciswapLiquidityClaimsService;

        const positionDetails = yield* getOciswapLiquidityClaimsService({
          lpResourceAddress: TEST_CONFIG.lpResourceAddress,
          nonFungibleLocalIds: [TEST_CONFIG.nftId],
          at_ledger_state: { state_version: 321803265 },
        });

        console.log("=== POSITION DETAILS DEBUG ===");
        console.log("NFT ID:", TEST_CONFIG.nftId);
        console.log(
          "Position details:",
          JSON.stringify(positionDetails, null, 2)
        );

        return positionDetails;
      }),
      TestLive
    );

    // @ts-ignore - Ignoring type errors to test functionality
    const result = await Effect.runPromise(program);
    console.log("Position details:", result);
  });

  it("should test tick math utilities", async () => {
    const { tickToPriceSqrt, removableAmounts } = await import(
      "./tickCalculator"
    );

    console.log("=== TICK MATH UTILITIES TEST ===");

    // Test tick to price conversion
    const testTicks = [-100, -50, 0, 50, 100];
    console.log("Tick to Price Sqrt conversions:");
    for (const tick of testTicks) {
      const priceSqrt = tickToPriceSqrt(tick);
      const price = priceSqrt.pow(2);
      console.log(
        `Tick ${tick}: priceSqrt=${priceSqrt.toString()}, price=${price.toString()}`
      );
    }

    // Test removable amounts calculation
    console.log("\nRemovable amounts test:");
    const testLiquidity = new (await import("decimal.js")).Decimal("1000000");
    const currentPriceSqrt = tickToPriceSqrt(0); // Current price at tick 0
    const leftBoundSqrt = tickToPriceSqrt(-50); // Lower bound
    const rightBoundSqrt = tickToPriceSqrt(50); // Upper bound

    const [xAmount, yAmount] = removableAmounts(
      testLiquidity,
      currentPriceSqrt,
      leftBoundSqrt,
      rightBoundSqrt,
      18, // x divisibility
      18 // y divisibility
    );

    console.log(`Test liquidity: ${testLiquidity.toString()}`);
    console.log(`Current price sqrt: ${currentPriceSqrt.toString()}`);
    console.log(`Left bound sqrt: ${leftBoundSqrt.toString()}`);
    console.log(`Right bound sqrt: ${rightBoundSqrt.toString()}`);
    console.log(`Removable X amount: ${xAmount.toString()}`);
    console.log(`Removable Y amount: ${yAmount.toString()}`);
  });
});

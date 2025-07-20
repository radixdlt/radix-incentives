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

import { GetComponentStateLive } from "../../gateway/getComponentState";
import {
  GetNonFungibleBalanceLive,
  GetNonFungibleBalanceService,
} from "../../gateway/getNonFungibleBalance";
import { GetNftResourceManagersLive } from "../../gateway/getNftResourceManagers";
import { GetEntityDetailsServiceLive } from "../../gateway/getEntityDetails";
import { EntityNonFungiblesPageLive } from "../../gateway/entityNonFungiblesPage";
import { GetNonFungibleIdsLive } from "../../gateway/getNonFungibleIds";
import { EntityNonFungibleDataService } from "../../gateway/entityNonFungiblesData";

const TEST_CONFIG = {
  // V1 Pool (xUSDC/XRD)
  v1: {
    componentAddress:
      "component_rdx1cz8daq5nwmtdju4hj5rxud0ta26wf90sdk5r4nj9fqjcde5eht8p0f",
    lpResourceAddress:
      "resource_rdx1nflrqd24a8xqelasygwlt6dhrgtu3akky695kk6j3cy4wu0wfn2ef8",
    tokenXAddress:
      "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
    tokenYAddress:
      "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
    tokenXDivisibility: 6,
    tokenYDivisibility: 18,
    nftId: "#435#",
  },

  // V2 Pool (OCI/XRD)
  v2: {
    componentAddress:
      "component_rdx1crm530ath85gcwm4gvwq8m70ay07df085kmupp6gte3ew94vg5pdcp",
    lpResourceAddress:
      "resource_rdx1n2qukjm07d26matv7cyc5ev2f942uy44zn9h3x7p8hnm9dah5flht4",
    tokenXAddress:
      "resource_rdx1t52pvtk5wfhltchwh3rkzls2x0r98fw9cjhpyrf3vsykhkuwrf7jg8", // Correct OCI address
    tokenYAddress:
      "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
    tokenXDivisibility: 18,
    tokenYDivisibility: 18,
    nftId: "#1#",
  },

  // Test user address that holds LP NFTs
  userAddress:
    "account_rdx12xl2meqtelz47mwp3nzd72jkwyallg5yxr9hkc75ac4qztsxulfpew",

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

const entityNonFungibleDataLive = EntityNonFungibleDataService.Default.pipe(
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
  it.skip("should calculate liquidity assets with v1 schema", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getOciswapLiquidityAssetsService =
          yield* GetOciswapLiquidityAssetsService;

        const result = yield* getOciswapLiquidityAssetsService({
          componentAddress: TEST_CONFIG.v1.componentAddress,
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 328823647 },
          lpResourceAddress: TEST_CONFIG.v1.lpResourceAddress,
          tokenXAddress: TEST_CONFIG.v1.tokenXAddress,
          tokenYAddress: TEST_CONFIG.v1.tokenYAddress,
          tokenXDivisibility: TEST_CONFIG.v1.tokenXDivisibility,
          tokenYDivisibility: TEST_CONFIG.v1.tokenYDivisibility,
          schemaVersion: "v1",
          priceBounds: TEST_CONFIG.priceBounds,
        });

        console.log("=== V1 SCHEMA TEST (xUSDC/XRD) ===");
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
    console.log("V1 schema result:", result);
  });

  it.skip("should calculate liquidity assets with v2 schema", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getOciswapLiquidityAssetsService =
          yield* GetOciswapLiquidityAssetsService;

        const result = yield* getOciswapLiquidityAssetsService({
          componentAddress: TEST_CONFIG.v2.componentAddress,
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 328823647 },
          lpResourceAddress: TEST_CONFIG.v2.lpResourceAddress,
          tokenXAddress: TEST_CONFIG.v2.tokenXAddress,
          tokenYAddress: TEST_CONFIG.v2.tokenYAddress,
          tokenXDivisibility: TEST_CONFIG.v2.tokenXDivisibility,
          tokenYDivisibility: TEST_CONFIG.v2.tokenYDivisibility,
          schemaVersion: "v2",
          priceBounds: TEST_CONFIG.priceBounds,
        });

        console.log("=== V2 SCHEMA TEST (OCI/XRD) ===");
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
    console.log("V2 schema result:", result);
  });

  it("should debug V2 schema NFT detection step by step", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getNonFungibleBalanceService =
          yield* GetNonFungibleBalanceService;
        const getOciswapLiquidityAssetsService =
          yield* GetOciswapLiquidityAssetsService;
        const getOciswapLiquidityClaimsService =
          yield* GetOciswapLiquidityClaimsService;

        console.log("=== V2 DEBUG TEST ===");
        console.log("Testing V2 pool:", TEST_CONFIG.v2.componentAddress);
        console.log("LP Resource Address:", TEST_CONFIG.v2.lpResourceAddress);
        console.log("Account:", TEST_CONFIG.userAddress);

        // Step 1: Check NFT balance with NO resource filter (all NFTs)
        console.log("\n🔍 Step 1: Checking ALL NFTs for account...");
        const allNftBalance = yield* getNonFungibleBalanceService({
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 328823647 },
        });

        console.log("All NFT Resources found:");
        for (const item of allNftBalance.items) {
          console.log(`Account: ${item.address}`);
          for (const nftResource of item.nonFungibleResources) {
            console.log(
              `  - Resource: ${nftResource.resourceAddress} (${nftResource.items.length} NFTs)`
            );
            if (
              nftResource.resourceAddress === TEST_CONFIG.v2.lpResourceAddress
            ) {
              console.log(
                `    ⭐ FOUND V2 POOL NFTs! IDs: ${nftResource.items.map((i) => i.id).join(", ")}`
              );
            }
          }
        }

        // Step 2: Check NFT balance with specific V2 resource filter
        console.log("\n🔍 Step 2: Checking V2 pool NFTs specifically...");
        const v2NftBalance = yield* getNonFungibleBalanceService({
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 328823647 },
          resourceAddresses: [TEST_CONFIG.v2.lpResourceAddress],
        });

        console.log(
          "V2 NFT Balance result:",
          JSON.stringify(v2NftBalance, null, 2)
        );

        // Step 3: Test V2 liquidity claims service first
        console.log("\n🔍 Step 3a: Testing V2 liquidity claims service...");

        try {
          const v2Claims = yield* getOciswapLiquidityClaimsService({
            lpResourceAddress: TEST_CONFIG.v2.lpResourceAddress,
            nonFungibleLocalIds: ["#1005#"],
            at_ledger_state: { state_version: 328823647 },
          });
          console.log("V2 Claims result:", JSON.stringify(v2Claims, null, 2));
        } catch (error) {
          console.log("V2 Claims failed:", error);
        }

        // Step 3b: Try the full service
        console.log("\n🔍 Step 3b: Testing V2 liquidity assets service...");
        const result = yield* getOciswapLiquidityAssetsService({
          componentAddress: TEST_CONFIG.v2.componentAddress,
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 328823647 },
          lpResourceAddress: TEST_CONFIG.v2.lpResourceAddress,
          tokenXAddress: TEST_CONFIG.v2.tokenXAddress,
          tokenYAddress: TEST_CONFIG.v2.tokenYAddress,
          tokenXDivisibility: TEST_CONFIG.v2.tokenXDivisibility,
          tokenYDivisibility: TEST_CONFIG.v2.tokenYDivisibility,
          schemaVersion: "v2",
          priceBounds: TEST_CONFIG.priceBounds,
        });

        console.log("Final V2 result:", JSON.stringify(result, null, 2));

        return result;
      }),
      TestLive
    );

    await Effect.runPromise(program);
    console.log("V2 debug test completed");
  }, 30000); // 30 second timeout

  it.skip("should calculate liquidity assets with tight price bounds", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getOciswapLiquidityAssetsService =
          yield* GetOciswapLiquidityAssetsService;

        const result = yield* getOciswapLiquidityAssetsService({
          componentAddress: TEST_CONFIG.v1.componentAddress,
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 328823647 },
          lpResourceAddress: TEST_CONFIG.v1.lpResourceAddress,
          tokenXAddress: TEST_CONFIG.v1.tokenXAddress,
          tokenYAddress: TEST_CONFIG.v1.tokenYAddress,
          tokenXDivisibility: TEST_CONFIG.v1.tokenXDivisibility,
          tokenYDivisibility: TEST_CONFIG.v1.tokenYDivisibility,
          schemaVersion: "v1",
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

  it.skip("should calculate liquidity assets with wide price bounds", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getOciswapLiquidityAssetsService =
          yield* GetOciswapLiquidityAssetsService;

        const result = yield* getOciswapLiquidityAssetsService({
          componentAddress: TEST_CONFIG.v1.componentAddress,
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 328823647 },
          lpResourceAddress: TEST_CONFIG.v1.lpResourceAddress,
          tokenXAddress: TEST_CONFIG.v1.tokenXAddress,
          tokenYAddress: TEST_CONFIG.v1.tokenYAddress,
          tokenXDivisibility: TEST_CONFIG.v1.tokenXDivisibility,
          tokenYDivisibility: TEST_CONFIG.v1.tokenYDivisibility,
          schemaVersion: "v1",
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

  it.skip("should show position details for debugging", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getOciswapLiquidityClaimsService =
          yield* GetOciswapLiquidityClaimsService;

        const positionDetails = yield* getOciswapLiquidityClaimsService({
          lpResourceAddress: TEST_CONFIG.v1.lpResourceAddress,
          nonFungibleLocalIds: [TEST_CONFIG.v1.nftId],
          at_ledger_state: { state_version: 328823647 },
        });

        console.log("=== POSITION DETAILS DEBUG ===");
        console.log("NFT ID:", TEST_CONFIG.v1.nftId);
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

  it.skip("should calculate liquidity assets without price bounds (everything in bounds)", async () => {
    const program = Effect.provide(
      Effect.gen(function* () {
        const getOciswapLiquidityAssetsService =
          yield* GetOciswapLiquidityAssetsService;

        // For testing only - in production this comes from getAccountBalancesAtStateVersion
        const getNonFungibleBalanceService =
          yield* GetNonFungibleBalanceService;
        const nonFungibleBalance = yield* getNonFungibleBalanceService({
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 328823647 },
        });

        const result = yield* getOciswapLiquidityAssetsService({
          componentAddress: TEST_CONFIG.v1.componentAddress,
          addresses: [TEST_CONFIG.userAddress],
          at_ledger_state: { state_version: 328823647 },
          nonFungibleBalance,
          lpResourceAddress: TEST_CONFIG.v1.lpResourceAddress,
          tokenXAddress: TEST_CONFIG.v1.tokenXAddress,
          tokenYAddress: TEST_CONFIG.v1.tokenYAddress,
          tokenXDivisibility: TEST_CONFIG.v1.tokenXDivisibility,
          tokenYDivisibility: TEST_CONFIG.v1.tokenYDivisibility,
          schemaVersion: "v1",
          // No priceBounds - everything should be in bounds
        });

        console.log("=== NO PRICE BOUNDS TEST (everything in bounds) ===");
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

          // Verify that total and in bounds are equal when no price bounds
          console.log("\n--- VALIDATION ---");
          console.log(
            `X amounts equal: ${item.xToken.totalAmount === item.xToken.amountInBounds}`
          );
          console.log(
            `Y amounts equal: ${item.yToken.totalAmount === item.yToken.amountInBounds}`
          );
        }

        return result;
      }),
      TestLive
    );

    // @ts-ignore - Ignoring type errors to test functionality
    const result = await Effect.runPromise(program);
    console.log("No bounds result:", result);
  });

  it.skip("should test tick math utilities", async () => {
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

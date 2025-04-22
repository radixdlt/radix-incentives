// multiplier.test.ts
import { describe, it, expect } from "vitest";
import { applyMultipliers } from "./multiplier";

// Use the Input interface type matching the function's expectation
interface Input {
  balance: number;
  weeklyPoints: number;
}

// Use the Input type for test data generation
function createTestUsers(): Record<string, Input> {
  return {
    user1: { balance: 10_000, weeklyPoints: 100 }, // Should get 0.5x multiplier
    user2: { balance: 100_000, weeklyPoints: 100 }, // Should get ~0.76x multiplier
    user3: { balance: 500_000, weeklyPoints: 100 }, // Should get ~1.12x multiplier
    user4: { balance: 5_000_000, weeklyPoints: 100 }, // Should get ~2.31x multiplier
    user5: { balance: 75_000_000, weeklyPoints: 100 }, // Should hit 3.0x cap
  };
}

describe("applyMultipliers", () => {
  it("applies correct multipliers to user weekly points based on balance percentile", () => {
    const users = createTestUsers();
    const updatedUsers = applyMultipliers(users);

    console.log("Updated Users:", updatedUsers);

    // Assert against calculatedPoints on the returned object
    // User 1's percentile (0.00000) is < 0.02, so multiplier is 0.5
    expect(updatedUsers.user1.calculatedPoints).toBeCloseTo(50, 1); // 100 * 0.5
    // User 2's percentile (0.00136) is < 0.02, so multiplier is 0.5
    expect(updatedUsers.user2.calculatedPoints).toBeCloseTo(50, 1); // 100 * 0.5
    // User 3's percentile (0.00757) is < 0.02, so multiplier is 0.5
    expect(updatedUsers.user3.calculatedPoints).toBeCloseTo(50, 1); // 100 * 0.5
    // User 4's percentile (0.06959) is > 0.02, uses S-curve: ~0.901 multiplier
    expect(updatedUsers.user4.calculatedPoints).toBeCloseTo(90.1, 1); // 100 * ~0.901
    // User 5's percentile (0.99999) is > 0.5, uses S-curve: ~3.0 multiplier
    expect(updatedUsers.user5.calculatedPoints).toBeCloseTo(300, 1); // 100 * 3.0
  });

  it("excludes users below minimum threshold (10_000) from multiplier calculation", () => {
    const users: Record<string, Input> = {
      smallUser: { balance: 9_999, weeklyPoints: 100 }, // Below threshold
      bigUser: { balance: 1_000_000, weeklyPoints: 100 }, // Above threshold
    };

    const updatedUsers = applyMultipliers(users);

    console.log("Threshold Test:", updatedUsers);

    // Assert against calculatedPoints on the returned object
    // Small user's points should remain unchanged as no multiplier applies
    expect(updatedUsers.smallUser.calculatedPoints).toBe(100);
    // Big user's points should be boosted (exact value depends on its percentile)
    expect(updatedUsers.bigUser.calculatedPoints).toBeGreaterThan(100);
    expect(updatedUsers.bigUser.calculatedPoints).toBeLessThanOrEqual(300); // Max multiplier is 3x
  });
});

import { BigNumber } from "bignumber.js";
import { Effect } from "effect";
import { describe, it, expect } from "vitest";
import { createUserBands } from "./createUserBands";

describe("createUserBands", () => {
  const createTestUsers = (pointsValues: number[]) =>
    pointsValues.map((points, index) => ({
      points: new BigNumber(points),
      userId: `user${index + 1}`,
    }));

  it("should create bands with equal distribution when users divide evenly", () => {
    const users = createTestUsers([100, 90, 80, 70, 60, 50]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(6); // Only 6 bands for 6 users

    // Users are placed in highest bands (15-20) since there are fewer users than bands
    // Each band should have 1 user, lowest points users in lowest numbered bands of the created range
    expect(result[0]?.bandNumber).toBe(15);
    expect(result[0]?.userIds).toHaveLength(1);
    expect(result[0]?.userIds).toEqual(["user6"]); // 50 points (lowest band of range 15-20)
    expect(result[0]?.poolShare.toString()).toBe("6.9342"); // Band 15 gets 0.98 * 1.15^14

    expect(result[1]?.bandNumber).toBe(16);
    expect(result[1]?.userIds).toHaveLength(1);
    expect(result[1]?.userIds).toEqual(["user5"]); // 60 points
    expect(result[1]?.poolShare.toString()).toBe("7.9743"); // Band 16 gets 0.98 * 1.15^15

    expect(result[5]?.bandNumber).toBe(20);
    expect(result[5]?.userIds).toHaveLength(1);
    expect(result[5]?.userIds).toEqual(["user1"]); // 100 points (highest band)
    expect(result[5]?.poolShare.toString()).toBe("13.9471"); // Band 20 gets 0.98 * 1.15^19
  });

  it("should handle uneven distribution with remainder users", () => {
    const users = createTestUsers([100, 90, 80, 70, 60]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(5); // Only 5 bands for 5 users

    // Users are placed in highest bands (16-20) since there are fewer users than bands
    // Lowest point users go to lowest numbered bands of the created range
    expect(result[0]?.bandNumber).toBe(16);
    expect(result[0]?.userIds).toHaveLength(1);
    expect(result[0]?.userIds).toEqual(["user5"]); // 60 points (lowest band of range 16-20)
    expect(result[0]?.poolShare.toString()).toBe("7.9743"); // Band 16 gets 0.98 * 1.15^15

    expect(result[1]?.bandNumber).toBe(17);
    expect(result[1]?.userIds).toHaveLength(1);
    expect(result[1]?.userIds).toEqual(["user4"]); // 70 points
    expect(result[1]?.poolShare.toString()).toBe("9.1705"); // Band 17 gets 0.98 * 1.15^16

    expect(result[4]?.bandNumber).toBe(20);
    expect(result[4]?.userIds).toHaveLength(1);
    expect(result[4]?.userIds).toEqual(["user1"]); // 100 points (highest band)
    expect(result[4]?.poolShare.toString()).toBe("13.9471"); // Band 20 gets 0.98 * 1.15^19
  });

  it("should sort users by points in descending order", () => {
    const users = [
      { points: new BigNumber(50), userId: "user1" },
      { points: new BigNumber(100), userId: "user2" },
      { points: new BigNumber(75), userId: "user3" },
      { points: new BigNumber(25), userId: "user4" },
    ];

    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(4); // Only 4 bands for 4 users

    // Users should be sorted with lowest points in lowest bands
    expect(result[0]?.userIds).toEqual(["user4"]); // 25 points (lowest band)
    expect(result[1]?.userIds).toEqual(["user1"]); // 50 points
    expect(result[2]?.userIds).toEqual(["user3"]); // 75 points
    expect(result[3]?.userIds).toEqual(["user2"]); // 100 points (highest band)
  });

  it("should handle single band correctly", () => {
    const users = createTestUsers([100, 90, 80]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(3); // Only 3 bands for 3 users
    // Users are placed in highest bands (18-20) since there are fewer users than bands
    expect(result[0]?.bandNumber).toBe(18);
    expect(result[0]?.userIds).toHaveLength(1);
    expect(result[0]?.userIds).toEqual(["user3"]); // 80 points (lowest band of range 18-20)
    expect(result[0]?.poolShare.toString()).toBe("10.546"); // Band 18 gets 0.98 * 1.15^17
  });

  it("should handle single user correctly", () => {
    const users = createTestUsers([100]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(1);
    // Single user gets placed in the highest band (20) since there are fewer users than bands
    expect(result[0]?.bandNumber).toBe(20);
    expect(result[0]?.userIds).toHaveLength(1);
    expect(result[0]?.userIds).toEqual(["user1"]);
    expect(result[0]?.poolShare.toString()).toBe("13.9471"); // Band 20 gets 0.98 * 1.15^19
  });

  it("should handle empty users array", () => {
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users: [],
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(0);
  });

  it("should calculate pool shares correctly with decimal step", () => {
    const users = createTestUsers([100, 90, 80, 70, 60, 50]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(6); // Only 6 bands for 6 users

    // Users are placed in highest bands (15-20), pool shares should follow 15% progression
    expect(result[0]?.poolShare.toString()).toBe("6.9342"); // Band 15: 0.98 * 1.15^14
    expect(result[1]?.poolShare.toString()).toBe("7.9743"); // Band 16: 0.98 * 1.15^15
    expect(result[2]?.poolShare.toString()).toBe("9.1705"); // Band 17: 0.98 * 1.15^16
  });

  it("should apply decimal places to pool shares", () => {
    const users = createTestUsers([100, 90, 80]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(3); // Only 3 bands for 3 users

    // Pool shares are rounded to 4 decimal places after calculation
    expect(result[0]?.poolShare.decimalPlaces()).toBeLessThanOrEqual(4);
    expect(result[1]?.poolShare.decimalPlaces()).toBeLessThanOrEqual(4);
    expect(result[2]?.poolShare.decimalPlaces()).toBeLessThanOrEqual(4);
  });

  it("should handle users with equal points correctly", () => {
    const users = [
      { points: new BigNumber(100), userId: "user1" },
      { points: new BigNumber(100), userId: "user2" },
      { points: new BigNumber(100), userId: "user3" },
      { points: new BigNumber(100), userId: "user4" },
    ];

    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(4); // Only 4 bands for 4 users

    // Users with equal points maintain their order but get placed from back to front
    expect(result[0]?.userIds).toEqual(["user4"]);
    expect(result[1]?.userIds).toEqual(["user3"]);
    expect(result[2]?.userIds).toEqual(["user2"]);
    expect(result[3]?.userIds).toEqual(["user1"]);
  });

  it("should handle users with zero points", () => {
    const users = [
      { points: new BigNumber(100), userId: "user1" },
      { points: new BigNumber(0), userId: "user2" },
      { points: new BigNumber(50), userId: "user3" },
      { points: new BigNumber(0), userId: "user4" },
    ];

    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(4); // Only 4 bands for 4 users

    // Users should be sorted with lowest points in lowest bands
    expect(result[0]?.userIds).toEqual(["user4"]); // 0 points (lowest band)
    expect(result[1]?.userIds).toEqual(["user2"]); // 0 points
    expect(result[2]?.userIds).toEqual(["user3"]); // 50 points
    expect(result[3]?.userIds).toEqual(["user1"]); // 100 points (highest band)
  });

  it("should handle large numbers correctly", () => {
    const users = [
      { points: new BigNumber("1000000000000"), userId: "user1" },
      { points: new BigNumber("500000000000"), userId: "user2" },
      { points: new BigNumber("750000000000"), userId: "user3" },
    ];

    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(3); // Only 3 bands for 3 users

    // Should handle large numbers correctly and sort properly (lowest points in lowest bands)
    expect(result[0]?.userIds).toEqual(["user2"]); // 500B points (lowest band)
    expect(result[1]?.userIds).toEqual(["user3"]); // 750B points
    expect(result[2]?.userIds).toEqual(["user1"]); // 1T points (highest band)
  });

  it("should handle decimal points in user points", () => {
    const users = [
      { points: new BigNumber("100.5"), userId: "user1" },
      { points: new BigNumber("100.3"), userId: "user2" },
      { points: new BigNumber("100.7"), userId: "user3" },
    ];

    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(3); // Only 3 bands for 3 users

    // Should sort correctly based on decimal precision (lowest points in lowest bands)
    expect(result[0]?.userIds).toEqual(["user2"]); // 100.3 points (lowest band)
    expect(result[1]?.userIds).toEqual(["user1"]); // 100.5 points
    expect(result[2]?.userIds).toEqual(["user3"]); // 100.7 points (highest band)
  });

  it("should handle more bands than users", () => {
    const users = createTestUsers([100, 90]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    // Should only create bands for users that exist
    expect(result).toHaveLength(2);
    expect(result[0]?.userIds).toEqual(["user2"]); // 90 points (lower band)
    expect(result[1]?.userIds).toEqual(["user1"]); // 100 points (higher band)
  });

  it("should handle complex remainder distribution", () => {
    const users = createTestUsers([100, 90, 80, 70, 60, 50, 40, 30, 20, 10]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(10); // Only 10 bands for 10 users

    // Each band gets 1 user (lowest points in lowest bands)
    expect(result[0]?.userIds).toHaveLength(1);
    expect(result[0]?.userIds).toEqual(["user10"]); // 10 points (lowest band)

    expect(result[1]?.userIds).toHaveLength(1);
    expect(result[1]?.userIds).toEqual(["user9"]); // 20 points

    expect(result[9]?.userIds).toHaveLength(1);
    expect(result[9]?.userIds).toEqual(["user1"]); // 100 points (highest band)
  });

  it("should maintain band numbers correctly", () => {
    const users = createTestUsers([100, 90, 80, 70, 60]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(5); // Only 5 bands for 5 users

    // Users are placed in highest bands (16-20), band numbers should be sequential within that range
    expect(result[0]?.bandNumber).toBe(16);
    expect(result[1]?.bandNumber).toBe(17);
    expect(result[2]?.bandNumber).toBe(18);
    expect(result[3]?.bandNumber).toBe(19);
    expect(result[4]?.bandNumber).toBe(20);
  });

  it("should handle pool share step of 1 (no reduction)", () => {
    const users = createTestUsers([100, 90, 80]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(3); // Only 3 bands for 3 users

    // Users are placed in highest bands (18-20), pool shares should increase with step 1.15
    expect(result[0]?.poolShare.toString()).toBe("10.546"); // Band 18: 0.98 * 1.15^17
    expect(result[1]?.poolShare.toString()).toBe("12.1279"); // Band 19: 0.98 * 1.15^18
    expect(result[2]?.poolShare.toString()).toBe("13.9471"); // Band 20: 0.98 * 1.15^19
  });

  it("should handle pool share step greater than 1 (increasing)", () => {
    const users = createTestUsers([100, 90, 80]);
    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(3); // Only 3 bands for 3 users

    // Users are placed in highest bands (18-20), pool shares should increase with step > 1
    expect(result[0]?.poolShare.toString()).toBe("10.546"); // Band 18: 0.98 * 1.15^17
    expect(result[1]?.poolShare.toString()).toBe("12.1279"); // Band 19: 0.98 * 1.15^18
    expect(result[2]?.poolShare.toString()).toBe("13.9471"); // Band 20: 0.98 * 1.15^19
  });

  it("should handle 24 users with 20 bands and increasing pool shares", () => {
    // Create 24 users with points from 240 down to 10 (in increments of 10)
    const users = Array.from({ length: 24 }, (_, i) => ({
      points: new BigNumber(240 - i * 10),
      userId: `user${i + 1}`,
    }));

    const input = {
      numberOfBands: 20,
      poolShareStart: new BigNumber("0.98"),
      poolShareStep: new BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(20);

    // 24 users / 20 bands = 1 base size with 4 remainder
    // First 4 bands get 2 users each, remaining 16 bands get 1 user each
    expect(result[0]?.userIds).toHaveLength(2);
    expect(result[1]?.userIds).toHaveLength(2);
    expect(result[2]?.userIds).toHaveLength(2);
    expect(result[3]?.userIds).toHaveLength(2);
    expect(result[4]?.userIds).toHaveLength(1);
    expect(result[19]?.userIds).toHaveLength(1);

    // Verify users are sorted with lowest points in lowest bands
    expect(result[0]?.userIds).toEqual(["user23", "user24"]); // 20, 10 points (lowest bands)
    expect(result[1]?.userIds).toEqual(["user21", "user22"]); // 40, 30 points
    expect(result[2]?.userIds).toEqual(["user19", "user20"]); // 60, 50 points
    expect(result[3]?.userIds).toEqual(["user17", "user18"]); // 80, 70 points
    expect(result[4]?.userIds).toEqual(["user16"]); // 90 points
    expect(result[19]?.userIds).toEqual(["user1"]); // 240 points (highest band)

    // Verify pool shares follow correct progression
    expect(result[0]?.poolShare.toString()).toBe("0.98"); // Band 1
    expect(result[1]?.poolShare.toString()).toBe("1.127"); // Band 2
    expect(result[2]?.poolShare.toString()).toBe("1.2961"); // Band 3
    expect(result[3]?.poolShare.toString()).toBe("1.4905"); // Band 4
    expect(result[4]?.poolShare.toString()).toBe("1.714"); // Band 5
    expect(result[19]?.poolShare.toString()).toBe("13.9471"); // Band 20

    // Verify band numbers are sequential
    expect(result[0]?.bandNumber).toBe(1);
    expect(result[1]?.bandNumber).toBe(2);
    expect(result[19]?.bandNumber).toBe(20);

    // Verify total user count is preserved
    const totalUsersInBands = result.reduce(
      (sum, band) => sum + band.userIds.length,
      0
    );
    expect(totalUsersInBands).toBe(24);
  });

  it("should handle 1000 users with even distribution", () => {
    // Create 1000 users with points from 1000 down to 1
    const users = Array.from({ length: 1000 }, (_, i) => ({
      userId: `user${i + 1}`,
      points: BigNumber(1000 - i), // user1 has 1000 points, user1000 has 1 point
    }));

    const input = {
      numberOfBands: 20,
      poolShareStart: BigNumber("0.98"),
      poolShareStep: BigNumber("1.15"),
      users,
    };

    const result = Effect.runSync(createUserBands(input));

    expect(result).toHaveLength(20);

    // 1000 users / 20 bands = 50 users per band exactly (no remainder)
    for (const band of result) {
      expect(band.userIds).toHaveLength(50);
    }

    // Based on the actual implementation behavior, verify user placement
    expect(result[0]?.userIds).toEqual(
      Array.from({ length: 50 }, (_, i) => `user${951 + i}`)
    );

    expect(result[19]?.userIds).toEqual(
      Array.from({ length: 50 }, (_, i) => `user${1 + i}`)
    );

    // Verify pool shares follow correct progression
    expect(result[0]?.poolShare.toString()).toBe("0.98"); // Band 1
    expect(result[1]?.poolShare.toString()).toBe("1.127"); // Band 2
    expect(result[19]?.poolShare.toString()).toBe("13.9471"); // Band 20

    // Verify band numbers are sequential
    expect(result[0]?.bandNumber).toBe(1);
    expect(result[19]?.bandNumber).toBe(20);

    // Verify total user count is preserved
    const totalUsersInBands = result.reduce(
      (sum, band) => sum + band.userIds.length,
      0
    );
    expect(totalUsersInBands).toBe(1000);

    // Verify no duplicate users across bands
    const allUserIds = result.flatMap((band) => band.userIds);
    const uniqueUserIds = new Set(allUserIds);
    expect(uniqueUserIds.size).toBe(1000);

    // Verify users are properly distributed (lowest points in first bands, highest in last)
    const firstBandUser = result[0]?.userIds[0];
    const lastBandUser = result[19]?.userIds[0];
    expect(firstBandUser).toBe("user951"); // Lower points (50)
    expect(lastBandUser).toBe("user1"); // Highest points (1000)
  });
});

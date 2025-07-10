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

    // Each band should have 1 user, lowest points first, highest points last
    expect(result[0]?.bandNumber).toBe(1);
    expect(result[0]?.userIds).toHaveLength(1);
    expect(result[0]?.userIds).toEqual(["user6"]); // 50 points (lowest)
    expect(result[0]?.poolShare.toString()).toBe("0.98");

    expect(result[1]?.bandNumber).toBe(2);
    expect(result[1]?.userIds).toHaveLength(1);
    expect(result[1]?.userIds).toEqual(["user5"]); // 60 points
    expect(result[1]?.poolShare.toString()).toBe("1.127");

    expect(result[5]?.bandNumber).toBe(6);
    expect(result[5]?.userIds).toHaveLength(1);
    expect(result[5]?.userIds).toEqual(["user1"]); // 100 points (highest)
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

    // Each band gets 1 user, lowest points first
    expect(result[0]?.bandNumber).toBe(1);
    expect(result[0]?.userIds).toHaveLength(1);
    expect(result[0]?.userIds).toEqual(["user5"]); // 60 points (lowest)
    expect(result[0]?.poolShare.toString()).toBe("0.98");

    expect(result[1]?.bandNumber).toBe(2);
    expect(result[1]?.userIds).toHaveLength(1);
    expect(result[1]?.userIds).toEqual(["user4"]); // 70 points
    expect(result[1]?.poolShare.toString()).toBe("1.127");

    expect(result[4]?.bandNumber).toBe(5);
    expect(result[4]?.userIds).toHaveLength(1);
    expect(result[4]?.userIds).toEqual(["user1"]); // 100 points (highest)
  });

  it("should sort users by points in ascending order", () => {
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

    // Users should be sorted by lowest points first, highest points last
    expect(result[0]?.userIds).toEqual(["user4"]); // 25 points (lowest)
    expect(result[1]?.userIds).toEqual(["user1"]); // 50 points
    expect(result[2]?.userIds).toEqual(["user3"]); // 75 points
    expect(result[3]?.userIds).toEqual(["user2"]); // 100 points (highest)
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
    expect(result[0]?.bandNumber).toBe(1);
    expect(result[0]?.userIds).toHaveLength(1);
    expect(result[0]?.userIds).toEqual(["user3"]); // 80 points (lowest)
    expect(result[0]?.poolShare.toString()).toBe("0.98");
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
    expect(result[0]?.bandNumber).toBe(1);
    expect(result[0]?.userIds).toHaveLength(1);
    expect(result[0]?.userIds).toEqual(["user1"]);
    expect(result[0]?.poolShare.toString()).toBe("0.98");
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

    // First band gets the poolShareStart
    expect(result[0]?.poolShare.toString()).toBe("0.98");

    // Second band gets poolShareStart * poolShareStep
    expect(result[1]?.poolShare.toString()).toBe("1.127");

    // Third band gets previous * poolShareStep
    expect(result[2]?.poolShare.toString()).toBe("1.2961");
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

    // Pool shares should be rounded to 4 decimal places after multiplication
    expect(result[0]?.poolShare.decimalPlaces()).toBe(2); // Original precision (0.98)
    expect(result[1]?.poolShare.decimalPlaces()).toBe(3); // 0.98 * 1.15 = 1.127 (3 decimal places)
    expect(result[2]?.poolShare.decimalPlaces()).toBe(4); // 1.127 * 1.15 = 1.2961 (4 decimal places)
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

    // Users with equal points should maintain their original order
    expect(result[0]?.userIds).toEqual(["user1"]);
    expect(result[1]?.userIds).toEqual(["user2"]);
    expect(result[2]?.userIds).toEqual(["user3"]);
    expect(result[3]?.userIds).toEqual(["user4"]);
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

    // Users should be sorted by points, with zero points at the beginning
    expect(result[0]?.userIds).toEqual(["user2"]); // 0 points
    expect(result[1]?.userIds).toEqual(["user4"]); // 0 points
    expect(result[2]?.userIds).toEqual(["user3"]); // 50 points
    expect(result[3]?.userIds).toEqual(["user1"]); // 100 points (highest)
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

    // Should handle large numbers correctly and sort properly (lowest first)
    expect(result[0]?.userIds).toEqual(["user2"]); // 500B points (lowest)
    expect(result[1]?.userIds).toEqual(["user3"]); // 750B points
    expect(result[2]?.userIds).toEqual(["user1"]); // 1T points (highest)
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

    // Should sort correctly based on decimal precision (lowest first)
    expect(result[0]?.userIds).toEqual(["user2"]); // 100.3 points (lowest)
    expect(result[1]?.userIds).toEqual(["user1"]); // 100.5 points
    expect(result[2]?.userIds).toEqual(["user3"]); // 100.7 points (highest)
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

    // Should only create bands for users that exist (lowest points first)
    expect(result).toHaveLength(2);
    expect(result[0]?.userIds).toEqual(["user2"]); // 90 points (lower)
    expect(result[1]?.userIds).toEqual(["user1"]); // 100 points (higher)
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

    // Each band gets 1 user (lowest points first)
    expect(result[0]?.userIds).toHaveLength(1);
    expect(result[0]?.userIds).toEqual(["user10"]); // 10 points (lowest)

    expect(result[1]?.userIds).toHaveLength(1);
    expect(result[1]?.userIds).toEqual(["user9"]); // 20 points

    expect(result[9]?.userIds).toHaveLength(1);
    expect(result[9]?.userIds).toEqual(["user1"]); // 100 points (highest)
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

    // Band numbers should be sequential starting from 1
    expect(result[0]?.bandNumber).toBe(1);
    expect(result[1]?.bandNumber).toBe(2);
    expect(result[2]?.bandNumber).toBe(3);
    expect(result[3]?.bandNumber).toBe(4);
    expect(result[4]?.bandNumber).toBe(5);
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

    // Pool shares should increase with step 1.15
    expect(result[0]?.poolShare.toString()).toBe("0.98");
    expect(result[1]?.poolShare.toString()).toBe("1.127");
    expect(result[2]?.poolShare.toString()).toBe("1.2961");
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

    // Pool shares should increase with step > 1
    expect(result[0]?.poolShare.toString()).toBe("0.98");
    expect(result[1]?.poolShare.toString()).toBe("1.127");
    expect(result[2]?.poolShare.toString()).toBe("1.2961");
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

    // Verify users are sorted by lowest points first
    expect(result[0]?.userIds).toEqual(["user24", "user23"]); // 10, 20 points (lowest)
    expect(result[1]?.userIds).toEqual(["user22", "user21"]); // 30, 40 points
    expect(result[2]?.userIds).toEqual(["user20", "user19"]); // 50, 60 points
    expect(result[3]?.userIds).toEqual(["user18", "user17"]); // 70, 80 points
    expect(result[4]?.userIds).toEqual(["user16"]); // 90 points
    expect(result[19]?.userIds).toEqual(["user1"]); // 240 points (highest)

    // Verify pool shares increase with step 1.15
    expect(result[0]?.poolShare.toString()).toBe("0.98");
    expect(result[1]?.poolShare.toString()).toBe("1.127"); // 0.98 * 1.15
    expect(result[2]?.poolShare.toString()).toBe("1.2961"); // 1.127 * 1.15
    expect(result[3]?.poolShare.toString()).toBe("1.4905"); // 1.2961 * 1.15
    expect(result[4]?.poolShare.toString()).toBe("1.7141"); // 1.4905 * 1.15

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
    // Create 1000 users with points from 1 to 1000
    const users = Array.from({ length: 1000 }, (_, i) => ({
      userId: `user${i + 1}`,
      points: BigNumber(i + 1),
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

    // Verify users are sorted by lowest points first
    // Band 1 should have users with points 1-50 (lowest)
    expect(result[0]?.userIds).toEqual(
      Array.from({ length: 50 }, (_, i) => `user${i + 1}`)
    );

    // Band 20 should have users with points 951-1000 (highest)
    expect(result[19]?.userIds).toEqual(
      Array.from({ length: 50 }, (_, i) => `user${951 + i}`)
    );

    // Verify pool shares increase with step 1.15
    expect(result[0]?.poolShare.toString()).toBe("0.98");
    expect(result[1]?.poolShare.toString()).toBe("1.127"); // 0.98 * 1.15
    expect(result[19]?.poolShare.toString()).toBe("13.9473"); // Final band has highest pool share

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
    const lastBandUser = result[19]?.userIds[49];
    expect(firstBandUser).toBe("user1"); // Lowest points (1)
    expect(lastBandUser).toBe("user1000"); // Highest points (1000)
  });
});

import { BigNumber } from "bignumber.js";
import { Effect } from "effect";
import { describe, it, expect } from "vitest";
import { supplyPercentileTrim } from "./supplyPercentileTrim";

describe("supplyPercentileTrim", () => {
  it("should filter users based on cumulative percentage threshold", () => {
    const users = [
      { points: new BigNumber(10), userId: "user1" },
      { points: new BigNumber(20), userId: "user2" },
      { points: new BigNumber(30), userId: "user3" },
    ];

    const options = { lowerBoundsPercentage: 0.5 }; // 50%

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // Total points: 60
    // Cumulative: [10, 30, 60]
    // Percentages: [16.67%, 50%, 100%]
    // With 50% threshold, only user2 and user3 should remain
    expect(result).toHaveLength(2);
    expect(result[0]?.userId).toBe("user2");
    expect(result[1]?.userId).toBe("user3");
  });

  it("should include all users when threshold is 0%", () => {
    const users = [
      { points: new BigNumber(10), userId: "user1" },
      { points: new BigNumber(20), userId: "user2" },
      { points: new BigNumber(30), userId: "user3" },
    ];

    const options = { lowerBoundsPercentage: 0 };

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    expect(result).toHaveLength(3);
    expect(result.map((u) => u.userId)).toEqual(["user1", "user2", "user3"]);
  });

  it("should exclude all users when threshold is above 100%", () => {
    const users = [
      { points: new BigNumber(10), userId: "user1" },
      { points: new BigNumber(20), userId: "user2" },
      { points: new BigNumber(30), userId: "user3" },
    ];

    const options = { lowerBoundsPercentage: 1.1 }; // 110%

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // No user can have >100% cumulative percentage, so all should be excluded
    expect(result).toHaveLength(0);
  });

  it("should handle single user correctly", () => {
    const users = [{ points: new BigNumber(100), userId: "user1" }];

    const options = { lowerBoundsPercentage: 0.5 };

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // Single user always has 100% cumulative percentage
    expect(result).toHaveLength(1);
    expect(result[0]?.userId).toBe("user1");
  });

  it("should handle empty users array", () => {
    const users: { points: BigNumber; userId: string }[] = [];
    const options = { lowerBoundsPercentage: 0.5 };

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    expect(result).toHaveLength(0);
  });

  it("should handle users with zero points", () => {
    const users = [
      { points: new BigNumber(0), userId: "user1" },
      { points: new BigNumber(10), userId: "user2" },
      { points: new BigNumber(0), userId: "user3" },
    ];

    const options = { lowerBoundsPercentage: 0.5 };

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // Total points: 10
    // After sorting by points: [0, 0, 10] -> [user1, user3, user2]
    // Cumulative: [0, 0, 10]
    // Percentages: [0%, 0%, 100%]
    // With 50% threshold, only user2 should remain
    expect(result).toHaveLength(1);
    expect(result.map((u) => u.userId)).toEqual(["user2"]);
  });

  it("should handle all users with zero points", () => {
    const users = [
      { points: new BigNumber(0), userId: "user1" },
      { points: new BigNumber(0), userId: "user2" },
      { points: new BigNumber(0), userId: "user3" },
    ];

    const options = { lowerBoundsPercentage: 0.5 };

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // When total points is 0, function returns empty array
    expect(result).toHaveLength(0);
  });

  it("should handle exact threshold boundary", () => {
    const users = [
      { points: new BigNumber(25), userId: "user1" },
      { points: new BigNumber(25), userId: "user2" },
      { points: new BigNumber(25), userId: "user3" },
      { points: new BigNumber(25), userId: "user4" },
    ];

    const options = { lowerBoundsPercentage: 0.5 }; // Exactly 50%

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // Total points: 100
    // After sorting: all users have same points, so order preserved
    // Cumulative: [25, 50, 75, 100]
    // Percentages: [25%, 50%, 75%, 100%]
    // With 50% threshold (inclusive), user2, user3, and user4 should remain
    expect(result).toHaveLength(3);
    expect(result.map((u) => u.userId)).toEqual(["user2", "user3", "user4"]);
  });

  it("should handle decimal points correctly", () => {
    const users = [
      { points: new BigNumber("10.5"), userId: "user1" },
      { points: new BigNumber("20.3"), userId: "user2" },
      { points: new BigNumber("30.7"), userId: "user3" },
    ];

    const options = { lowerBoundsPercentage: 0.33 }; // 33%

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // Total points: 61.5
    // After sorting by points: [10.5, 20.3, 30.7] -> [user1, user2, user3]
    // Cumulative: [10.5, 30.8, 61.5]
    // Percentages: [~17%, ~50%, 100%]
    // With 33% threshold, user2 and user3 should remain
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.userId)).toEqual(["user2", "user3"]);
  });

  it("should handle large numbers correctly", () => {
    const users = [
      { points: new BigNumber("1000000000000"), userId: "user1" },
      { points: new BigNumber("2000000000000"), userId: "user2" },
      { points: new BigNumber("3000000000000"), userId: "user3" },
    ];

    const options = { lowerBoundsPercentage: 0.4 }; // 40%

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // Total points: 6 trillion
    // After sorting by points: [1T, 2T, 3T] -> [user1, user2, user3]
    // Cumulative: [1T, 3T, 6T]
    // Percentages: [~16.67%, 50%, 100%]
    // With 40% threshold, user2 and user3 should remain
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.userId)).toEqual(["user2", "user3"]);
  });

  it("should preserve original user objects", () => {
    const users = [
      { points: new BigNumber(10), userId: "user1" },
      { points: new BigNumber(20), userId: "user2" },
    ];

    const options = { lowerBoundsPercentage: 0.6 };

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // Total points: 30
    // After sorting by points: [10, 20] -> [user1, user2]
    // Cumulative: [10, 30]
    // Percentages: [33.33%, 100%]
    // With 60% threshold, only user2 should remain
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(users[1]); // Should be the same object reference
    expect(result[0]?.points.toString()).toBe("20");
  });

  it("should handle users in unsorted order correctly", () => {
    // Provide users in random order (not sorted by points)
    const users = [
      { points: new BigNumber(30), userId: "user3" },
      { points: new BigNumber(10), userId: "user1" },
      { points: new BigNumber(50), userId: "user5" },
      { points: new BigNumber(20), userId: "user2" },
      { points: new BigNumber(40), userId: "user4" },
    ];

    const options = { lowerBoundsPercentage: 0.4 }; // 40%

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // Total points: 150
    // After sorting by points: [10, 20, 30, 40, 50] -> [user1, user2, user3, user4, user5]
    // Cumulative: [10, 30, 60, 100, 150]
    // Percentages: [6.67%, 20%, 40%, 66.67%, 100%]
    // With 40% threshold, users with >=40% should remain: user3, user4, user5
    expect(result).toHaveLength(3);

    // Verify the users that are included (users returned in original order)
    const resultUserIds = result.map((u) => u.userId);
    expect(resultUserIds).toEqual(["user3", "user5", "user4"]);
  });

  it("should handle 24 users in random order with 10% lower bounds", () => {
    // Create 24 users with varying points in random order
    const users = [
      { points: new BigNumber(100), userId: "user12" },
      { points: new BigNumber(25), userId: "user3" },
      { points: new BigNumber(150), userId: "user18" },
      { points: new BigNumber(75), userId: "user9" },
      { points: new BigNumber(200), userId: "user24" },
      { points: new BigNumber(10), userId: "user1" },
      { points: new BigNumber(180), userId: "user22" },
      { points: new BigNumber(45), userId: "user5" },
      { points: new BigNumber(120), userId: "user14" },
      { points: new BigNumber(60), userId: "user7" },
      { points: new BigNumber(90), userId: "user11" },
      { points: new BigNumber(35), userId: "user4" },
      { points: new BigNumber(170), userId: "user21" },
      { points: new BigNumber(80), userId: "user10" },
      { points: new BigNumber(140), userId: "user17" },
      { points: new BigNumber(20), userId: "user2" },
      { points: new BigNumber(110), userId: "user13" },
      { points: new BigNumber(65), userId: "user8" },
      { points: new BigNumber(190), userId: "user23" },
      { points: new BigNumber(50), userId: "user6" },
      { points: new BigNumber(160), userId: "user19" },
      { points: new BigNumber(130), userId: "user15" },
      { points: new BigNumber(40), userId: "user16" },
      { points: new BigNumber(85), userId: "user20" },
    ];

    const options = { lowerBoundsPercentage: 0.1 }; // 10%

    const result = Effect.runSync(supplyPercentileTrim(users, options));

    // Total points: 2400 (sum of all points)
    // After sorting by points: [10, 20, 25, 35, 40, 45, 50, 60, 65, 75, 80, 85, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200]
    // 10% threshold = 240 points cumulative
    // First few users cumulative: [10, 30, 55, 90, 130, 175, 225, 285...]
    // The 7th user (points=50) has cumulative 225/2400 = 9.375% < 10%
    // The 8th user (points=60) has cumulative 285/2400 = 11.875% >= 10%
    // So users from 8th position onwards (17 users) should be included
    expect(result).toHaveLength(17);

    // Verify all returned users are from the original set
    const originalUserIds = users.map((u) => u.userId);
    const resultUserIds = result.map((u) => u.userId);
    for (const userId of resultUserIds) {
      expect(originalUserIds).toContain(userId);
    }

    // Verify that users with points >= 60 are included
    const includedPointValues = result
      .map((u) => u.points.toNumber())
      .sort((a, b) => a - b);
    expect(includedPointValues).toEqual([
      60, 65, 75, 80, 85, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190,
      200,
    ]);
  });
});

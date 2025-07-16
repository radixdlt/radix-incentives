import { BigNumber } from "bignumber.js";
import { Effect } from "effect";
import { describe, it, expect } from "vitest";
import { distributeSeasonPoints } from "./distributePoints";

describe("distributeSeasonPoints", () => {
  it("should distribute points correctly across multiple bands with multiple users", () => {
    const input = {
      pointsPool: new BigNumber("1000"),
      bands: [
        {
          userIds: ["user1", "user2"],
          poolShare: new BigNumber("0.3"), // 300 points total, 150 each
        },
        {
          userIds: ["user3", "user4", "user5"],
          poolShare: new BigNumber("0.5"), // 500 points total, 166.666... each
        },
        {
          userIds: ["user6"],
          poolShare: new BigNumber("0.2"), // 200 points total, 200 for user6
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(6);

    // Band 1 users should get 150 points each
    const user1Result = result.find((r) => r.userId === "user1");
    const user2Result = result.find((r) => r.userId === "user2");
    expect(user1Result?.seasonPoints).toEqual(new BigNumber("150"));
    expect(user2Result?.seasonPoints).toEqual(new BigNumber("150"));

    // Band 2 users should get 166.666... points each
    const user3Result = result.find((r) => r.userId === "user3");
    const user4Result = result.find((r) => r.userId === "user4");
    const user5Result = result.find((r) => r.userId === "user5");
    expect(user3Result?.seasonPoints.toString()).toBe(
      "166.66666666666666666667"
    );
    expect(user4Result?.seasonPoints.toString()).toBe(
      "166.66666666666666666667"
    );
    expect(user5Result?.seasonPoints.toString()).toBe(
      "166.66666666666666666667"
    );

    // Band 3 user should get 200 points
    const user6Result = result.find((r) => r.userId === "user6");
    expect(user6Result?.seasonPoints).toEqual(new BigNumber("200"));

    // Verify all users are present
    const userIds = result.map((r) => r.userId).sort();
    expect(userIds).toEqual([
      "user1",
      "user2",
      "user3",
      "user4",
      "user5",
      "user6",
    ]);
  });

  it("should handle single band with single user", () => {
    const input = {
      pointsPool: new BigNumber("500"),
      bands: [
        {
          userIds: ["user1"],
          poolShare: new BigNumber("1.0"), // All points go to user1
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(1);
    expect(result[0]?.userId).toBe("user1");
    expect(result[0]?.seasonPoints).toEqual(new BigNumber("500"));
  });

  it("should handle empty bands array", () => {
    const input = {
      pointsPool: new BigNumber("1000"),
      bands: [],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(0);
  });

  it("should handle bands with empty userIds", () => {
    const input = {
      pointsPool: new BigNumber("1000"),
      bands: [
        {
          userIds: [],
          poolShare: new BigNumber("0.3"),
        },
        {
          userIds: ["user1", "user2"],
          poolShare: new BigNumber("0.7"),
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    // Only users from the second band should be present
    expect(result).toHaveLength(2);
    expect(result[0]?.userId).toBe("user1");
    expect(result[0]?.seasonPoints).toEqual(new BigNumber("350"));
    expect(result[1]?.userId).toBe("user2");
    expect(result[1]?.seasonPoints).toEqual(new BigNumber("350"));
  });

  it("should handle zero points pool", () => {
    const input = {
      pointsPool: new BigNumber("0"),
      bands: [
        {
          userIds: ["user1", "user2"],
          poolShare: new BigNumber("0.5"),
        },
        {
          userIds: ["user3"],
          poolShare: new BigNumber("0.5"),
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(3);
    for (const userResult of result) {
      expect(userResult.seasonPoints).toEqual(new BigNumber("0"));
    }
  });

  it("should handle zero pool share", () => {
    const input = {
      pointsPool: new BigNumber("1000"),
      bands: [
        {
          userIds: ["user1", "user2"],
          poolShare: new BigNumber("0"), // No points for this band
        },
        {
          userIds: ["user3"],
          poolShare: new BigNumber("1.0"), // All points for this band
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(3);

    // Users in first band should get 0 points
    const user1Result = result.find((r) => r.userId === "user1");
    const user2Result = result.find((r) => r.userId === "user2");
    expect(user1Result?.seasonPoints).toEqual(new BigNumber("0"));
    expect(user2Result?.seasonPoints).toEqual(new BigNumber("0"));

    // User in second band should get all points
    const user3Result = result.find((r) => r.userId === "user3");
    expect(user3Result?.seasonPoints).toEqual(new BigNumber("1000"));
  });

  it("should handle decimal points pool and pool shares", () => {
    const input = {
      pointsPool: new BigNumber("123.456789"),
      bands: [
        {
          userIds: ["user1"],
          poolShare: new BigNumber("0.3333"), // 41.152262637 points
        },
        {
          userIds: ["user2", "user3"],
          poolShare: new BigNumber("0.6667"), // 82.304526363 points total, 41.1522631815 each
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(3);

    const user1Result = result.find((r) => r.userId === "user1");
    expect(user1Result?.seasonPoints.toFixed(9)).toBe("41.148147774");

    const user2Result = result.find((r) => r.userId === "user2");
    const user3Result = result.find((r) => r.userId === "user3");
    expect(user2Result?.seasonPoints.toFixed(10)).toBe("41.1543206132");
    expect(user3Result?.seasonPoints.toFixed(10)).toBe("41.1543206132");
  });

  it("should handle very large numbers", () => {
    const input = {
      pointsPool: new BigNumber("999999999999999999999"),
      bands: [
        {
          userIds: ["user1"],
          poolShare: new BigNumber("0.5"),
        },
        {
          userIds: ["user2"],
          poolShare: new BigNumber("0.5"),
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(2);
    for (const userResult of result) {
      expect(userResult.seasonPoints.toString()).toBe(
        "499999999999999999999.5"
      );
    }
  });

  it("should handle very small numbers", () => {
    const input = {
      pointsPool: new BigNumber("0.000001"),
      bands: [
        {
          userIds: ["user1", "user2"],
          poolShare: new BigNumber("1.0"),
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(2);
    for (const userResult of result) {
      expect(userResult.seasonPoints.toString()).toBe("5e-7");
    }
  });

  it("should maintain precision with BigNumber arithmetic", () => {
    const input = {
      pointsPool: new BigNumber("1"),
      bands: [
        {
          userIds: ["user1", "user2", "user3"],
          poolShare: new BigNumber("1"),
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(3);
    for (const userResult of result) {
      expect(userResult.seasonPoints.toString()).toBe("0.33333333333333333333");
    }

    // Verify that summing the results gives back the original pool
    const totalDistributed = result.reduce(
      (sum, userResult) => sum.plus(userResult.seasonPoints),
      new BigNumber("0")
    );
    expect(totalDistributed.toString()).toBe("0.99999999999999999999");
  });

  it("should handle pool shares that sum to more than 1", () => {
    const input = {
      pointsPool: new BigNumber("100"),
      bands: [
        {
          userIds: ["user1"],
          poolShare: new BigNumber("0.8"),
        },
        {
          userIds: ["user2"],
          poolShare: new BigNumber("0.7"),
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(2);

    const user1Result = result.find((r) => r.userId === "user1");
    const user2Result = result.find((r) => r.userId === "user2");
    expect(user1Result?.seasonPoints).toEqual(new BigNumber("80"));
    expect(user2Result?.seasonPoints).toEqual(new BigNumber("70"));

    // Total distributed should be 150 (more than original pool of 100)
    const totalDistributed = result.reduce(
      (sum, userResult) => sum.plus(userResult.seasonPoints),
      new BigNumber("0")
    );
    expect(totalDistributed).toEqual(new BigNumber("150"));
  });

  it("should preserve user order within bands", () => {
    const input = {
      pointsPool: new BigNumber("300"),
      bands: [
        {
          userIds: ["userZ", "userA", "userM"],
          poolShare: new BigNumber("1.0"),
        },
      ],
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    expect(result).toHaveLength(3);
    // Users should appear in the same order as in the input
    expect(result[0]?.userId).toBe("userZ");
    expect(result[1]?.userId).toBe("userA");
    expect(result[2]?.userId).toBe("userM");

    for (const userResult of result) {
      expect(userResult.seasonPoints).toEqual(new BigNumber("100"));
    }
  });

  it("should handle large scale distribution with 20 bands and 100 users each", () => {
    // Pool shares for bands 1-20 (exponential progression - higher bands get more points)
    const poolShares = [
      0.98, 1.12, 1.29, 1.49, 1.71, 1.97, 2.26, 2.6, 2.99, 3.44, 3.95, 4.55,
      5.23, 6.01, 6.92, 7.95, 9.15, 10.52, 12.1, 13.91,
    ];

    // Create 20 bands with 100 users each (2000 total users)
    const bands = Array.from({ length: 20 }, (_, bandIndex) => {
      const userIds = Array.from(
        { length: 100 },
        (_, userIndex) => `user_band${bandIndex + 1}_${userIndex + 1}`
      );

      const poolShare = new BigNumber(poolShares[bandIndex]);

      return {
        userIds,
        poolShare,
      };
    });

    const input = {
      pointsPool: new BigNumber("100000"),
      bands,
    };

    const result = Effect.runSync(distributeSeasonPoints(input));

    // Should have 2000 users total (20 bands × 100 users)
    expect(result).toHaveLength(2000);

    // Group results by band to verify distribution
    const resultsByBand = Array.from({ length: 20 }, (_, bandIndex) => {
      return result.filter((r) =>
        r.userId.startsWith(`user_band${bandIndex + 1}_`)
      );
    });

    // Verify each band has exactly 100 users
    for (let bandIndex = 0; bandIndex < 20; bandIndex++) {
      expect(resultsByBand[bandIndex]).toHaveLength(100);
    }

    // Verify that users within each band get equal points
    for (let bandIndex = 0; bandIndex < 20; bandIndex++) {
      const bandResults = resultsByBand[bandIndex];
      const expectedPoolShare = new BigNumber(poolShares[bandIndex]);
      const expectedBandTotal =
        input.pointsPool.multipliedBy(expectedPoolShare);
      const expectedPointsPerUser = expectedBandTotal.dividedBy(100);

      for (const userResult of bandResults) {
        expect(userResult.seasonPoints.toString()).toBe(
          expectedPointsPerUser.toString()
        );
      }
    }

    // Verify that higher bands (higher index) get more points than lower bands (lower index)
    // Band 1 gets least (0.98), Band 20 gets most (13.91)
    const band1UserPoints = resultsByBand[0][0]?.seasonPoints;
    const band10UserPoints = resultsByBand[9][0]?.seasonPoints;
    const band20UserPoints = resultsByBand[19][0]?.seasonPoints;

    expect(band1UserPoints).toBeDefined();
    expect(band10UserPoints).toBeDefined();
    expect(band20UserPoints).toBeDefined();

    if (band1UserPoints && band10UserPoints && band20UserPoints) {
      expect(band20UserPoints.isGreaterThan(band10UserPoints)).toBe(true);
      expect(band10UserPoints.isGreaterThan(band1UserPoints)).toBe(true);
    }

    // Verify total points distributed matches expected total
    const totalDistributed = result.reduce(
      (sum, userResult) => sum.plus(userResult.seasonPoints),
      new BigNumber("0")
    );

    // Calculate expected total based on sum of all pool shares
    const totalPoolShares = bands.reduce(
      (sum, band) => sum.plus(band.poolShare),
      new BigNumber("0")
    );
    const expectedTotal = input.pointsPool.multipliedBy(totalPoolShares);

    expect(totalDistributed.toString()).toBe(expectedTotal.toString());

    // Verify user ordering is preserved within bands
    for (let bandIndex = 0; bandIndex < 20; bandIndex++) {
      const bandResults = resultsByBand[bandIndex];
      for (let userIndex = 0; userIndex < 100; userIndex++) {
        const expectedUserId = `user_band${bandIndex + 1}_${userIndex + 1}`;
        expect(bandResults[userIndex]?.userId).toBe(expectedUserId);
      }
    }
  });
});

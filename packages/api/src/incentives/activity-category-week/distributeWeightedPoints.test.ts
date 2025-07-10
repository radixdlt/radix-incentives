import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import BigNumber from "bignumber.js";
import { distributeWeightedPoints } from "./distributeWeightedPoints";

describe("distributeWeightedPoints", () => {
  it("should distribute points according to weighted multipliers", async () => {
    const input = {
      pointsPool: new BigNumber(1000),
      items: [
        { id: "item1", multiplier: new BigNumber(0.5) },
        { id: "item2", multiplier: new BigNumber(1.0) },
        { id: "item3", multiplier: new BigNumber(1.5) },
        { id: "item4", multiplier: new BigNumber(2.0) },
      ],
    };

    const result = await Effect.runPromise(distributeWeightedPoints(input));

    expect(result).toHaveLength(4);
    expect(result[0].id).toBe("item1");
    expect(result[0].points.toNumber()).toBe(100); // (0.5 / 5.0) * 1000
    expect(result[1].id).toBe("item2");
    expect(result[1].points.toNumber()).toBe(200); // (1.0 / 5.0) * 1000
    expect(result[2].id).toBe("item3");
    expect(result[2].points.toNumber()).toBe(300); // (1.5 / 5.0) * 1000
    expect(result[3].id).toBe("item4");
    expect(result[3].points.toNumber()).toBe(400); // (2.0 / 5.0) * 1000

    // Verify total points equals pool
    const totalPoints = result.reduce(
      (sum, item) => sum.plus(item.points),
      new BigNumber(0)
    );
    expect(totalPoints.toNumber()).toBe(1000);
  });

  it("should handle empty items array", async () => {
    const input = {
      pointsPool: new BigNumber(1000),
      items: [],
    };

    const result = await Effect.runPromise(distributeWeightedPoints(input));
    expect(result).toHaveLength(0);
  });

  it("should handle zero multipliers", async () => {
    const input = {
      pointsPool: new BigNumber(1000),
      items: [
        { id: "item1", multiplier: new BigNumber(0) },
        { id: "item2", multiplier: new BigNumber(0) },
      ],
    };

    const result = await Effect.runPromise(distributeWeightedPoints(input));
    expect(result).toHaveLength(0);
  });

  it("should handle equal distribution when all multipliers are the same", async () => {
    const input = {
      pointsPool: new BigNumber(1000),
      items: [
        { id: "item1", multiplier: new BigNumber(1) },
        { id: "item2", multiplier: new BigNumber(1) },
        { id: "item3", multiplier: new BigNumber(1) },
        { id: "item4", multiplier: new BigNumber(1) },
      ],
    };

    const result = await Effect.runPromise(distributeWeightedPoints(input));

    expect(result).toHaveLength(4);
    for (const item of result) {
      expect(item.points.toNumber()).toBe(250); // 1000 / 4
    }
  });

  it("should distribute points with one item at 0.5 and rest at 1", async () => {
    const input = {
      pointsPool: new BigNumber(1000),
      items: [
        { id: "item1", multiplier: new BigNumber(0.5) },
        { id: "item2", multiplier: new BigNumber(1) },
        { id: "item3", multiplier: new BigNumber(1) },
        { id: "item4", multiplier: new BigNumber(1) },
      ],
    };

    const result = await Effect.runPromise(distributeWeightedPoints(input));

    expect(result).toHaveLength(4);
    expect(result[0].id).toBe("item1");
    expect(result[0].points.toNumber()).toBeCloseTo(142.86, 2); // (0.5 / 3.5) * 1000
    expect(result[1].id).toBe("item2");
    expect(result[1].points.toNumber()).toBeCloseTo(285.71, 2); // (1.0 / 3.5) * 1000
    expect(result[2].id).toBe("item3");
    expect(result[2].points.toNumber()).toBeCloseTo(285.71, 2); // (1.0 / 3.5) * 1000
    expect(result[3].id).toBe("item4");
    expect(result[3].points.toNumber()).toBeCloseTo(285.71, 2); // (1.0 / 3.5) * 1000

    // Verify total points equals pool
    const totalPoints = result.reduce(
      (sum, item) => sum.plus(item.points),
      new BigNumber(0)
    );
    expect(totalPoints.toNumber()).toBeCloseTo(1000, 2);
  });

  it("should distribute points with one item at 0 and rest at 1", async () => {
    const input = {
      pointsPool: new BigNumber(1000),
      items: [
        { id: "item1", multiplier: new BigNumber(0) },
        { id: "item2", multiplier: new BigNumber(1) },
        { id: "item3", multiplier: new BigNumber(1) },
        { id: "item4", multiplier: new BigNumber(1) },
      ],
    };

    const result = await Effect.runPromise(distributeWeightedPoints(input));

    expect(result).toHaveLength(4);
    expect(result[0].id).toBe("item1");
    expect(result[0].points.toNumber()).toBe(0); // (0 / 3) * 1000
    expect(result[1].id).toBe("item2");
    expect(result[1].points.toNumber()).toBeCloseTo(333.33, 2); // (1 / 3) * 1000
    expect(result[2].id).toBe("item3");
    expect(result[2].points.toNumber()).toBeCloseTo(333.33, 2); // (1 / 3) * 1000
    expect(result[3].id).toBe("item4");
    expect(result[3].points.toNumber()).toBeCloseTo(333.33, 2); // (1 / 3) * 1000

    // Verify total points equals pool
    const totalPoints = result.reduce(
      (sum, item) => sum.plus(item.points),
      new BigNumber(0)
    );
    expect(totalPoints.toNumber()).toBeCloseTo(1000, 2);
  });
});

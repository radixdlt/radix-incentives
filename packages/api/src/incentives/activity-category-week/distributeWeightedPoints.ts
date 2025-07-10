import { Effect } from "effect";
import BigNumber from "bignumber.js";

export interface WeightedItem {
  id: string;
  multiplier: BigNumber;
}

export const distributeWeightedPoints = Effect.fn(function* (input: {
  pointsPool: BigNumber;
  items: WeightedItem[];
}) {
  if (input.items.length === 0) {
    return [];
  }

  // Calculate total multiplier sum
  const totalMultiplier = input.items.reduce(
    (sum, item) => sum.plus(item.multiplier),
    new BigNumber(0)
  );

  if (totalMultiplier.isZero()) {
    return [];
  }

  // Calculate points for each item
  const results = input.items.map((item) => {
    const percentage = item.multiplier.dividedBy(totalMultiplier);
    const points = input.pointsPool.multipliedBy(percentage);

    return {
      id: item.id,
      points,
    };
  });

  return results;
});

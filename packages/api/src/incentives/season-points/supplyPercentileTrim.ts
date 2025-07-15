import { BigNumber } from "bignumber.js";
import { Effect } from "effect";

export const supplyPercentileTrim = (
  users: { points: BigNumber; userId: string }[],
  options: { lowerBoundsPercentage: number }
) =>
  Effect.gen(function* () {
    const totalPoints = users.reduce(
      (acc, curr) => acc.plus(curr.points),
      new BigNumber(0)
    );

    const pointsMatrix = users.reduce<BigNumber[]>((acc, curr, index, arr) => {
      const pointsBefore = arr
        .slice(0, index)
        .reduce((acc, curr) => acc.plus(curr.points), new BigNumber(0));

      acc.push(curr.points.plus(pointsBefore));
      return acc;
    }, []);

    return users.filter((_, index) => {
      const cumulativePoints = pointsMatrix[index];
      if (!cumulativePoints) {
        return false;
      }

      return cumulativePoints
        .dividedBy(totalPoints)
        .gte(options.lowerBoundsPercentage);
    });
  });

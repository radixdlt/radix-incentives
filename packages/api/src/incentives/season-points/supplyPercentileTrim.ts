import { BigNumber } from "bignumber.js";
import { Effect } from "effect";

/**
 * Filters users based on cumulative percentage threshold.
 * Users are included if their cumulative percentage (from start to their position)
 * meets or exceeds the lower bounds percentage.
 *
 * @param users - Array of users with points and userId
 * @param options - Configuration object with lowerBoundsPercentage threshold
 * @returns Effect containing filtered users array
 */
export const supplyPercentileTrim = (
  users: { points: BigNumber; userId: string }[],
  options: { lowerBoundsPercentage: number }
) =>
  Effect.gen(function* () {
    const totalPoints = users.reduce(
      (acc, curr) => acc.plus(curr.points),
      new BigNumber(0)
    );

    // Handle edge case where total points is zero
    if (totalPoints.isZero()) {
      return [];
    }

    // Sort users by points in ascending order for consistent cumulative calculation
    const sortedUsers = [...users].sort((a, b) => {
      const comparison = a.points.comparedTo(b.points);
      return comparison ?? 0; // Handle potential null return
    });

    const pointsMatrix = sortedUsers.reduce<BigNumber[]>(
      (acc, curr, index, arr) => {
        const pointsBefore = arr
          .slice(0, index)
          .reduce((acc, curr) => acc.plus(curr.points), new BigNumber(0));

        acc.push(curr.points.plus(pointsBefore));
        return acc;
      },
      []
    );

    // Create a Set of userIds that meet the threshold for efficient lookup
    const qualifiedUserIds = new Set<string>();
    sortedUsers.forEach((user, index) => {
      const cumulativePoints = pointsMatrix[index];
      if (cumulativePoints) {
        const cumulativePercentage = cumulativePoints.dividedBy(totalPoints);
        if (cumulativePercentage.gte(options.lowerBoundsPercentage)) {
          qualifiedUserIds.add(user.userId);
        }
      }
    });

    // Return users in their original order, but only those that qualified
    return users.filter((user) => qualifiedUserIds.has(user.userId));
  });

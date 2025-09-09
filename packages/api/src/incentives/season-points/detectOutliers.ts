import { BigNumber } from 'bignumber.js';
import { Effect } from 'effect';

/**
 * Detects outliers in the supply by finding top suppliers above a certain percentage threshold.
 * Calculates total supply and percentage supply for each of top 10 suppliers.
 * If they are above outlierThresholdPercentage O, then excludes them from the user set.
 *
 * @param users - Array of users with points and userId
 * @param outlierThresholdPercentage - Percentage threshold above which users are considered outliers
 * @param activityCategory - Activity category for logging
 * @returns Effect containing users array with outliers excluded
 */
export const detectOutliers = (
  users: { points: BigNumber; userId: string; multiplier: string }[],
  outlierThresholdPercentage: BigNumber,
  activityCategory: string,
) =>
  Effect.gen(function* () {
    // Handle edge cases
    if (users.length === 0) {
      return users;
    }

    const totalSupply = users.reduce(
      (acc, curr) => acc.plus(curr.points),
      new BigNumber(0),
    );

    // Handle edge case where total supply is zero
    if (totalSupply.isZero()) {
      return users;
    }

    // Sort users by points in descending order to get top suppliers
    const sortedUsers = [...users].sort((a, b) => {
      const comparison = b.points.comparedTo(a.points);
      return comparison ?? 0; // Handle potential null return
    });

    // Get top 10 suppliers (or all users if less than 10)
    const topSuppliers = sortedUsers.slice(0, Math.min(10, sortedUsers.length));

    // Calculate percentage supply for each top supplier and identify outliers
    const outlierUserIds = new Set<string>();

    for (const supplier of topSuppliers) {
      const supplyPercentage = supplier.points.dividedBy(totalSupply);

      if (supplyPercentage.gt(outlierThresholdPercentage)) {
        outlierUserIds.add(supplier.userId);
      }
    }

    // Filter out outliers from original user set
    const usersWithoutOutliers = users.filter(
      (user) => !outlierUserIds.has(user.userId),
    );

    yield* Effect.logDebug({
      writeToFile: true,
      name: `outliers-${outlierThresholdPercentage}-${activityCategory}`,
      data: {
        totalUsers: users.length,
        totalSupply: totalSupply.toString(),
        outlierThreshold: outlierThresholdPercentage.toString(),
        outliersDetected: outlierUserIds.size,
        outlierUsers: topSuppliers
          .filter((user) => outlierUserIds.has(user.userId))
          .map((user) => ({
            userId: user.userId,
            points: user.points.toString(),
            supplyPercentage: user.points.dividedBy(totalSupply).toString(),
          })),
        usersAfterOutlierRemoval: usersWithoutOutliers.length,
      },
    });

    yield* Effect.log(
      `Detected ${outlierUserIds.size} outliers in ${activityCategory} category. ` +
        `Removed from ${users.length} to ${usersWithoutOutliers.length} users.`,
    );

    return usersWithoutOutliers;
  });

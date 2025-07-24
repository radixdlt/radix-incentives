import { Effect } from "effect";
import type { BigNumber } from "bignumber.js";

/**
 * Distributes season points from a total points pool across multiple user bands.
 *
 * This function implements a band-based reward distribution system where users are grouped
 * into bands, and each band receives a specific share of the total points pool. Within each
 * band, points are distributed equally among all users.
 *
 * ## How it works:
 * 1. For each band, calculate total points: `pointsPool × band.poolShare`
 * 2. Divide band points equally among users: `bandPoints ÷ userCount`
 * 3. Return individual user allocations across all bands
 *
 * ## Use case:
 * This is typically used in the season points calculation pipeline where users have been
 * sorted by activity and grouped into performance bands. Higher-performing users are placed
 * in bands with larger pool shares, creating a tiered reward system.
 *
 * @param input - Configuration for points distribution
 * @param input.pointsPool - Total points available for distribution
 * @param input.bands - Array of user bands with their respective pool shares
 * @param input.bands[].userIds - Array of user IDs in this band
 * @param input.bands[].poolShare - Fraction of total pool allocated to this band (e.g., 0.3 = 30%)
 *
 * @returns Effect that yields an array of user season point allocations
 *
 * @example
 * ```typescript
 * const result = distributeSeasonPoints({
 *   pointsPool: new BigNumber("1000"),
 *   bands: [
 *     {
 *       userIds: ["user1", "user2"],
 *       poolShare: new BigNumber("0.6") // 600 points total, 300 each
 *     },
 *     {
 *       userIds: ["user3"],
 *       poolShare: new BigNumber("0.4") // 400 points for user3
 *     }
 *   ]
 * });
 * // Returns: [
 * //   { userId: "user1", seasonPoints: BigNumber(300) },
 * //   { userId: "user2", seasonPoints: BigNumber(300) },
 * //   { userId: "user3", seasonPoints: BigNumber(400) }
 * // ]
 * ```
 *
 * @example Edge cases:
 * ```typescript
 * // Empty bands
 * distributeSeasonPoints({ pointsPool: new BigNumber("100"), bands: [] })
 * // Returns: []
 *
 * // Zero points pool
 * distributeSeasonPoints({
 *   pointsPool: new BigNumber("0"),
 *   bands: [{ userIds: ["user1"], poolShare: new BigNumber("1") }]
 * })
 * // Returns: [{ userId: "user1", seasonPoints: BigNumber(0) }]
 *
 * // Bands with empty userIds are skipped
 * distributeSeasonPoints({
 *   pointsPool: new BigNumber("100"),
 *   bands: [{ userIds: [], poolShare: new BigNumber("0.5") }]
 * })
 * // Returns: []
 * ```
 *
 * ## Notes:
 * - Pool shares can sum to any value (not necessarily 1.0)
 * - Uses BigNumber for precise decimal arithmetic
 * - Preserves user order within bands
 * - Bands with empty userIds arrays contribute no results
 * - Division by user count in each band ensures equal distribution within bands
 */
export const distributeSeasonPoints = (input: {
  pointsPool: BigNumber;
  bands: {
    userIds: string[];
    poolShare: BigNumber;
  }[];
}) => {
  return Effect.gen(function* () {
    const points = yield* Effect.forEach(input.bands, (band) => {
      return Effect.gen(function* () {
        const points = input.pointsPool.multipliedBy(band.poolShare);
        const pointsPerUser = points.dividedBy(band.userIds.length);

        return band.userIds.map((userId) => {
          return { userId, seasonPoints: pointsPerUser };
        });
      });
    });

    return points.flat();
  });
};

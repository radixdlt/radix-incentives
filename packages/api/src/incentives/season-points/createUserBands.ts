import { BigNumber } from "bignumber.js";
import { Effect } from "effect";

/**
 * Creates user bands for reward distribution based on points and pool share allocation.
 *
 * This function groups users into bands (tiers) for reward distribution, where users with
 * higher points receive higher pool shares. This creates a reward system that incentivizes
 * better performance and higher participation.
 *
 * @param input - Configuration for band creation
 * @param input.numberOfBands - Number of bands to create
 * @param input.poolShareStart - Starting pool share for the first band (lowest share)
 * @param input.poolShareStep - Multiplier to calculate subsequent band shares (e.g., 1.15 increases by 15%)
 * @param input.users - Array of users with their points and IDs
 *
 * @returns Effect that yields an array of bands with user IDs and pool shares
 *
 * @example
 * ```typescript
 * const result = createUserBands({
 *   numberOfBands: 3,
 *   poolShareStart: new BigNumber("0.98"),
 *   poolShareStep: new BigNumber("1.15"),
 *   users: [
 *     { points: new BigNumber(100), userId: "user1" },
 *     { points: new BigNumber(50), userId: "user2" },
 *     { points: new BigNumber(25), userId: "user3" }
 *   ]
 * });
 * // Returns bands where user1 (highest points) gets highest pool share in the last band
 * ```
 *
 * ## Behavior:
 * - **Sorting**: Users are sorted by points in **ascending order** (lowest points first)
 * - **Band Distribution**: Users are divided as evenly as possible across bands
 * - **Pool Shares**: Each band gets a progressively higher pool share (last band gets highest share)
 * - **Remainder Handling**: If users don't divide evenly, the first bands get extra users
 *
 * ## Edge Cases:
 * - **Empty Users**: Returns empty array if no users provided
 * - **Single User**: Creates one band with that user
 * - **More Bands Than Users**: Creates one band per user, ignoring excess band count
 * - **Equal Points**: Users with identical points maintain their original array order
 * - **Zero Points**: Users with zero points are included and sorted to the beginning (lowest rewards)
 * - **Large Numbers**: Handles BigNumber precision correctly for large point values
 * - **Decimal Points**: Maintains precision for decimal point values
 * - **Pool Share Precision**: Pool shares are rounded to 4 decimal places after step calculation
 *
 * ## Pool Share Calculation:
 * - Band 1: `poolShareStart`
 * - Band 2: `poolShareStart * poolShareStep`
 * - Band 3: `(poolShareStart * poolShareStep) * poolShareStep`
 * - And so on...
 *
 * @example Pool Share with step 1.15:
 * ```
 * Band 1: 0.9800 (lowest rewards for lowest points)
 * Band 2: 1.1270 (higher rewards)
 * Band 3: 1.2961 (highest rewards for highest points)
 * ```
 */
export const createUserBands = (input: {
  numberOfBands: number;
  poolShareStart: BigNumber;
  poolShareStep: BigNumber;
  users: { points: BigNumber; userId: string }[];
}) =>
  Effect.gen(function* () {
    // Sort users by points in ascending order (lowest points first)
    // This puts highest point users in later bands which have higher pool shares
    const sortedUsers = input.users.sort((a, b) => {
      const comparison = new BigNumber(a.points).comparedTo(
        new BigNumber(b.points)
      );
      return comparison ?? 0;
    });

    // Calculate band configuration
    const totalSurvivingUsers = sortedUsers.length;

    const numberOfBands = input.numberOfBands;
    const poolShareStart = input.poolShareStart;
    const poolShareStep = input.poolShareStep;

    const baseBandSize = Math.floor(totalSurvivingUsers / numberOfBands);
    const remainder = totalSurvivingUsers % numberOfBands;

    yield* Effect.log(
      `creating ${numberOfBands} bands with base size ${baseBandSize} users each. ${remainder} bands will have ${baseBandSize + 1} users (${totalSurvivingUsers} surviving users)`
    );

    const bands = Array.from({ length: numberOfBands }, (_, i) => i).reduce(
      (acc, i) => {
        // First 'remainder' bands get an extra user
        const bandSize = i < remainder ? baseBandSize + 1 : baseBandSize;
        const startIndex = acc.reduce(
          (sum, band) => sum + band.userIds.length,
          0
        );
        const endIndex = startIndex + bandSize;
        const band = sortedUsers.slice(startIndex, endIndex);
        const lastPoolShare = acc.at(-1)?.poolShare;

        const poolShare =
          lastPoolShare?.multipliedBy(poolShareStep).decimalPlaces(4) ??
          poolShareStart;

        if (band.length > 0) {
          acc.push({
            bandNumber: i + 1,
            userIds: band.map((user) => user.userId),
            poolShare,
          });
        }

        return acc;
      },
      [] as {
        bandNumber: number;
        userIds: string[];
        poolShare: BigNumber;
      }[]
    );

    return bands;
  });

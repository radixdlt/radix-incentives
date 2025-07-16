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
 * - **Sorting**: Users are sorted by points in **descending order** (highest points first), then reversed to place highest point users in later bands
 * - **Band Distribution**: Users are divided as evenly as possible across bands
 * - **Pool Shares**: Each band gets a progressively higher pool share (last band gets highest share)
 * - **Remainder Handling**: If users don't divide evenly, the first bands (lower rewards) get extra users
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
    // Sort users by points in descending order (highest points first)
    // Highest point users will go to later bands which have higher pool shares
    const sortedUsers = input.users.sort((a, b) => {
      const comparison = new BigNumber(b.points).comparedTo(
        new BigNumber(a.points)
      );
      return comparison ?? 0;
    });

    // Calculate band configuration
    const totalSurvivingUsers = sortedUsers.length;

    // Only create bands for users that exist
    const actualNumberOfBands = Math.min(
      input.numberOfBands,
      totalSurvivingUsers
    );

    if (actualNumberOfBands === 0) {
      yield* Effect.log(
        "created 0 bands with base size 0 users each. 0 bands will have 1 users (0 surviving users)",
        { bands: [] }
      );
      return [];
    }

    const baseBandSize = Math.floor(totalSurvivingUsers / actualNumberOfBands);
    const remainder = totalSurvivingUsers % actualNumberOfBands;

    // Calculate starting band number - if fewer users than bands, start from highest bands
    const startingBandNumber = input.numberOfBands - actualNumberOfBands + 1;

    const bands: {
      bandNumber: number;
      userIds: string[];
      poolShare: BigNumber;
    }[] = [];

    let currentUserIndex = 0;

    // Create bands from startingBandNumber to numberOfBands
    for (let bandIndex = 0; bandIndex < actualNumberOfBands; bandIndex++) {
      // First 'remainder' bands get an extra user (lower reward bands get extra users)
      const bandSize = bandIndex < remainder ? baseBandSize + 1 : baseBandSize;

      // Get users for this band (lowest points users go to lowest bands)
      const endIndex = totalSurvivingUsers - currentUserIndex;
      const startIndex = endIndex - bandSize;
      const bandUsers = sortedUsers.slice(startIndex, endIndex);
      currentUserIndex += bandSize;

      // Calculate the actual band number
      const actualBandNumber = startingBandNumber + bandIndex;

      // Calculate pool share for this band based on the actual band number
      // Pool share calculation uses (actualBandNumber - 1) as the exponent since band 1 should get exponent 0
      const poolShare = input.poolShareStart
        .multipliedBy(input.poolShareStep.pow(actualBandNumber - 1))
        .decimalPlaces(4);

      bands.push({
        bandNumber: actualBandNumber,
        userIds: bandUsers.map((user) => user.userId),
        poolShare,
      });
    }

    yield* Effect.log(
      `created ${bands.length} bands with base size ${baseBandSize} users each. ${remainder} bands will have ${baseBandSize + 1} users (${totalSurvivingUsers} surviving users)`,
      {
        bands: bands.map((band) => ({
          bandNumber: band.bandNumber,
          numberOfUsers: band.userIds.length,
          poolShare: band.poolShare.toString(),
        })),
      }
    );

    return bands;
  });

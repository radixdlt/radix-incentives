import { BigNumber } from "bignumber.js";
import { Effect } from "effect";

export const createUserBands = (input: {
  numberOfBands: number;
  poolShareStart: BigNumber;
  poolShareStep: BigNumber;
  users: { points: BigNumber; userId: string }[];
}) =>
  Effect.gen(function* () {
    // Sort users by points in descending order (highest points first)
    const sortedUsers = input.users.sort((a, b) => {
      const comparison = new BigNumber(a.points).comparedTo(
        new BigNumber(b.points)
      );
      return comparison ?? 0;
    });

    // Calculate band configuration
    const totalSurvivingUsers = sortedUsers.length;

    // TODO: Don't create more bands than users
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

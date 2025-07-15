import { Effect } from "effect";

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
        const points = input.pointsPool.multipliedBy(band.poolShare).dividedBy(100);
        const pointsPerUser = points.dividedBy(band.userIds.length);

        return band.userIds.map((userId) => {
          return { userId, seasonPoints: pointsPerUser };
        });
      });
    });

    return points.flat();
  });
};

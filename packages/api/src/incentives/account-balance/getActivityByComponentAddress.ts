import { Action, componentAddressActivityDataMap } from "data";
import { Effect, Data } from "effect";

class ActivityNotFoundError extends Data.TaggedError("ActivityNotFoundError")<{
  componentAddress: string;
}> {}

export const getActivitiesDataByComponentAddress = Effect.fn(function* (
  componentAddress: string
) {
  const activitiesData = componentAddressActivityDataMap[componentAddress];

  if (!activitiesData || activitiesData.length === 0) {
    return yield* Effect.fail(new ActivityNotFoundError({ componentAddress }));
  }

  return activitiesData;
});

export const getLpActivitiesDataByComponentAddress = Effect.fn(function* (
  componentAddress: string
) {
  const activitiesData =
    yield* getActivitiesDataByComponentAddress(componentAddress);

  const lpActivitiesData = activitiesData.filter(
    (activityData) => activityData.action === Action.LP
  );

  return lpActivitiesData;
});

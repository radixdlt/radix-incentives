import {
  type AccountBalanceData,
  Action,
  activityDataByDappId,
  type DappId,
} from "data";
import { Effect } from "effect";

export const getDefaultLpPositions = Effect.fn(function* (dAppId: DappId) {
  const lpActivities = activityDataByDappId[dAppId].filter(
    (activity) => activity.action === Action.LP
  );

  const defaultValues: AccountBalanceData[] = lpActivities.map((activity) => ({
    activityId: activity.activityId,
    usdValue: "0",
  }));

  return defaultValues;
});

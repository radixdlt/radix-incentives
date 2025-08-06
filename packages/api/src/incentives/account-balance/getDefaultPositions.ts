import {
  type AccountBalanceData,
  type Action,
  type DappId,
  activityDataByDappId,
} from 'data';
import { Effect } from 'effect';

export const getDefaultPositions = Effect.fn(function* (
  dAppId: DappId,
  actions: Action[],
) {
  const positions = activityDataByDappId[dAppId].filter((activity) =>
    actions.includes(activity.action),
  );

  const defaultValues: AccountBalanceData[] = positions.map((activity) => ({
    activityId: activity.activityId,
    usdValue: '0',
  }));

  return defaultValues;
});

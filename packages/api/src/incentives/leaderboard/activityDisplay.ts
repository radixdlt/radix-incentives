import { activityData } from 'data';
import { Effect } from 'effect';
import { DappService } from '../dapp/dapp';

export class ActivityDisplayService extends Effect.Service<ActivityDisplayService>()(
  'ActivityDisplayService',
  {
    dependencies: [DappService.Default],
    effect: Effect.gen(function* () {
      const dappService = yield* DappService;

      const activityDataMap = activityData.reduce(
        (acc, activity) => {
          acc[activity.activityId] = activity;
          return acc;
        },
        {} as Record<string, (typeof activityData)[number]>,
      );

      const dappList = yield* dappService.list();
      const dappNames = dappList.reduce(
        (acc, dapp) => {
          acc[dapp.id] = dapp.name;
          return acc;
        },
        {} as Record<string, string>,
      );

      return {
        generateActivityDisplayName: Effect.fn(function* (params: {
          activityId: string;
          activityName: string | null;
        }) {
          const { activityId, activityName } = params;

          // Look up activity data from the map
          const activity = activityDataMap[activityId];

          if (activity && activity.action === 'lp') {
            // For LP activities, generate name from activity data
            const dappName = dappNames[activity.dAppId] || activity.dAppId;
            const tokenPair = activity.tokenPair;

            if (tokenPair.includes('-')) {
              // Multiple tokens: tokena-tokenb
              const tokens = tokenPair.split('-').map(
                (token) => token.toUpperCase(), // Convert to uppercase for better readability
              );
              return `${tokens.join('/')} to ${dappName}`;
            } else {
              // Single token
              return `${tokenPair.toUpperCase()} to ${dappName}`;
            }
          } else if (activityName) {
            // For non-LP activities, use database name if available
            return activityName;
          } else {
            // Fall back to activity ID
            return activityId;
          }
        }),
      };
    }),
  },
) {}

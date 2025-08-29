import { Effect } from 'effect';

/**
 * Service responsible for generating display names for activities
 */
export class ActivityDisplayService extends Effect.Service<ActivityDisplayService>()(
  'ActivityDisplayService',
  {
    effect: Effect.gen(function* () {
      return {
        /**
         * Check if an activity is a liquidity pool activity
         */
        isLpActivity: (activityId: string) => {
          return activityId.includes('_lp');
        },

        /**
         * Generate a readable name for LP activities
         */
        generateLpActivityName: (activityId: string) => {
          // Check if it matches the LP pattern: dapp_lp_type_tokena-tokenb
          const lpPattern = /^(oc|su|c9|dp)_lp_(?:blu|nat|der|sta)_(.+)$/;
          const match = activityId.match(lpPattern);

          if (!match) {
            return activityId; // Not a recognized LP activity pattern, return original ID
          }

          const [, dappCode, tokenPair] = match;

          // Map dapp codes to readable names
          const dappNames: Record<string, string> = {
            oc: 'Ociswap',
            su: 'Surge',
            c9: 'CaviarNine',
            dp: 'DefiPlaza',
          };

          const dappName = dappNames[dappCode!] || dappCode!;

          // Handle token pair formatting
          if (tokenPair!.includes('-')) {
            // Multiple tokens: tokena-tokenb
            const tokens = tokenPair!.split('-').map(
              (token) => token.toUpperCase(), // Convert to uppercase for better readability
            );
            return `${tokens.join('/')} to ${dappName}`;
          } else {
            // Single token
            return `${tokenPair!.toUpperCase()} to ${dappName}`;
          }
        },

        /**
         * Generate display name for any activity (LP or regular)
         */
        generateActivityDisplayName: (params: {
          activityId: string;
          activityName: string | null;
        }) => {
          const { activityId, activityName } = params;
          const isLp = activityId.includes('_lp');

          // For LP activities, always use generated name (override database name)
          if (isLp) {
            // Check if it matches the LP pattern: dapp_lp_type_tokena-tokenb
            const lpPattern = /^(oc|su|c9|dp)_lp_(?:blu|nat|der|sta)_(.+)$/;
            const match = activityId.match(lpPattern);

            if (!match) {
              return activityId; // Not a recognized LP activity pattern, return original ID
            }

            const [, dappCode, tokenPair] = match;

            // Map dapp codes to readable names
            const dappNames: Record<string, string> = {
              oc: 'Ociswap',
              su: 'Surge',
              c9: 'CaviarNine',
              dp: 'DefiPlaza',
            };

            const dappName = dappNames[dappCode!] || dappCode!;

            // Handle token pair formatting
            if (tokenPair!.includes('-')) {
              // Multiple tokens: tokena-tokenb
              const tokens = tokenPair!.split('-').map(
                (token) => token.toUpperCase(), // Convert to uppercase for better readability
              );
              return `${tokens.join('/')} to ${dappName}`;
            } else {
              // Single token
              return `${tokenPair!.toUpperCase()} to ${dappName}`;
            }
          } else if (activityName) {
            // For non-LP activities, use database name if available
            return activityName;
          } else {
            // Fall back to activity ID
            return activityId;
          }
        },
      };
    }),
  },
) {}

export const ActivityDisplayServiceLive = ActivityDisplayService.Default;

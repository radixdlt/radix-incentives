import { SeasonId } from 'shared/brandedTypes';
import { api } from '~/trpc/react';

/**
 * Fetches claiming status for a season with fail-closed semantics.
 * If the query errors, claimingEnabled defaults to false to prevent
 * showing a claim form that the server will reject.
 */
export const useClaimingEnabled = (seasonId: string) => {
  const { data, isLoading, isError } =
    api.seasonReward.isClaimingEnabled.useQuery({
      seasonId: SeasonId.make(seasonId),
    });

  return {
    claimingEnabled: isError ? false : (data?.claimingEnabled ?? false),
    isLoading,
    isError,
  };
};

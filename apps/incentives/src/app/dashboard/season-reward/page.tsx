'use client';

import { Array as A, Option, pipe } from 'effect';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated } from '~/lib/hooks/useIsAuthenticated';
import { api } from '~/trpc/react';
import PageHeader from './components/header';
import { LoadingSkeleton } from './components/loading-skeleton';
import { SeasonRewardCard } from './components/season-reward-card';

export default function SeasonRewardPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  const { data: seasons, isLoading: seasonsLoading } =
    api.season.getSeasons.useQuery();

  // Only fetch user rewards when authenticated
  const { data: userSeasonRewards, isLoading: rewardsLoading } =
    api.seasonReward.getUserSeasonRewards.useQuery(undefined, {
      enabled: Boolean(isAuthenticated),
    });

  const { data: allClaims, isLoading: claimsLoading } =
    api.seasonReward.getAllUserSeasonRewardClaims.useQuery(undefined, {
      enabled: Boolean(isAuthenticated),
    });

  // Loading state - only wait for seasons if not authenticated
  const isLoading = isAuthenticated
    ? seasonsLoading || rewardsLoading || claimsLoading
    : seasonsLoading;

  // Get completed seasons
  const completedSeasons = pipe(
    Option.fromNullable(seasons),
    Option.map(A.filter((s) => s.status === 'completed')),
    Option.getOrElse(() => [] as NonNullable<typeof seasons>),
  );

  // Build season data with rewards if available
  const seasonsWithRewards = completedSeasons.map((season) => {
    const reward = pipe(
      Option.fromNullable(userSeasonRewards),
      Option.flatMap(A.findFirst((r) => r.seasonId === season.id)),
      Option.getOrUndefined,
    );

    const claims = pipe(
      Option.fromNullable(allClaims),
      Option.map(A.filter((c) => c.seasonId === season.id)),
      Option.getOrElse(() => [] as NonNullable<typeof allClaims>),
    );

    return {
      seasonId: season.id,
      seasonName: season.name,
      amount: reward?.amount ?? '0',
      claims,
      hasReward: Boolean(reward),
    };
  });

  return (
    <div>
      <PageHeader>Season Rewards</PageHeader>

      <div className="mt-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : completedSeasons.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">
              No completed seasons available yet.
            </p>
            <p className="text-muted-foreground text-sm">
              Check back later when a season has been completed.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {seasonsWithRewards.map((season) => (
              <SeasonRewardCard
                key={season.seasonId}
                seasonId={season.seasonId}
                seasonName={season.seasonName}
                amount={season.amount}
                claims={season.claims}
                hasReward={season.hasReward}
                onClaim={
                  season.hasReward
                    ? () => {
                        router.push(
                          `/dashboard/season-reward/${season.seasonId}`,
                        );
                      }
                    : undefined
                }
                showRedeem
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

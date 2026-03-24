'use client';

import { Array as A, Option, pipe } from 'effect';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SeasonId } from 'shared/brandedTypes';
import { Skeleton } from '~/components/ui/skeleton';
import { useClaimingEnabled } from '~/lib/hooks/useClaimingEnabled';
import { useIsAuthenticated } from '~/lib/hooks/useIsAuthenticated';
import { api } from '~/trpc/react';
import PageHeader from './components/header';
import { LoadingSkeleton } from './components/loading-skeleton';
import {
  SeasonRewardCard,
  type SeasonRewardCardProps,
} from './components/season-reward-card';

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

  // Get completed seasons
  const completedSeasons = pipe(
    Option.fromNullable(seasons),
    Option.map(A.filter((s) => s.status === 'completed')),
    Option.getOrElse(() => [] as NonNullable<typeof seasons>),
  );

  // Fetch vester info for first completed season (they share the same vester config)
  const firstCompletedSeasonId = pipe(
    A.head(completedSeasons),
    Option.map((s) => SeasonId.make(s.id)),
    Option.getOrUndefined,
  );

  const { data: vesterInfo, isLoading: vesterLoading } =
    api.seasonReward.getVesterInfo.useQuery(
      { seasonId: firstCompletedSeasonId! },
      {
        enabled: Boolean(firstCompletedSeasonId),
        retry: false,
      },
    );

  // Loading state - only wait for seasons if not authenticated
  const isLoading = isAuthenticated
    ? seasonsLoading || rewardsLoading || claimsLoading
    : seasonsLoading;

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

      {/* 2-Step Process Explanation */}
      <div className="mt-6 mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="mb-3 font-medium text-sm text-white/80">
          Getting your season rewards is a 2-step process:
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-start gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 font-bold text-green-400 text-xs">
              1
            </div>
            <div>
              <p className="font-medium text-sm text-white">Claim</p>
              <p className="text-white/60 text-xs">
                Claim your reward pool units to your wallet. No penalty or
                vesting applies.
              </p>
            </div>
          </div>
          <ArrowRight className="mx-2 hidden h-4 w-4 shrink-0 text-white/40 sm:block" />
          <div className="flex flex-1 items-start gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 font-bold text-blue-400 text-xs">
              2
            </div>
            <div>
              <p className="font-medium text-sm text-white">Redeem</p>
              <p className="text-white/60 text-xs">
                Redeem pool units for XRD. Early redemption incurs a penalty
                until vesting completes.
              </p>
            </div>
          </div>
        </div>
      </div>

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
              <SeasonRewardCardWithClaimingStatus
                key={season.seasonId}
                seasonId={season.seasonId}
                seasonName={season.seasonName}
                amount={season.amount}
                claims={season.claims}
                hasReward={season.hasReward}
                vesterInfo={vesterInfo}
                onNavigateToClaim={() =>
                  router.push(`/dashboard/season-reward/${season.seasonId}`)
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

type SeasonRewardCardWithClaimingStatusProps = Omit<
  SeasonRewardCardProps,
  'onClaim' | 'claimingEnabled'
> & {
  onNavigateToClaim: () => void;
};

/**
 * Wrapper that fetches claiming status per season card.
 * Each card makes an individual query — this could be batched into a single
 * endpoint in the future if the number of completed seasons grows large.
 */
const SeasonRewardCardWithClaimingStatus = ({
  onNavigateToClaim,
  ...props
}: SeasonRewardCardWithClaimingStatusProps) => {
  const { claimingEnabled, isLoading } = useClaimingEnabled(props.seasonId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  return (
    <SeasonRewardCard
      {...props}
      claimingEnabled={claimingEnabled}
      onClaim={
        props.hasReward && claimingEnabled ? onNavigateToClaim : undefined
      }
    />
  );
};

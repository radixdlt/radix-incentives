'use client';
import { TRPCClientError } from '@trpc/client';
import BigNumber from 'bignumber.js';
import { Array as A, Option, pipe } from 'effect';
import { AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { type Amount, SeasonId } from 'shared/brandedTypes';
import { toast } from 'sonner';
import { Card, CardContent } from '~/components/ui/card';
import { EmptyState } from '~/components/ui/empty-state';
import { api, type RouterOutputs } from '~/trpc/react';
import { SeasonRewardCard } from '../components/season-reward-card';
import { SlideIn } from '../helpers/slideIn';
import { ClaimTransactionList } from './components/claim-transaction-list';
import { PageHeader } from './components/page-header';
import { RequestClaimForm } from './components/request-claim-form';
import { SelectAccount } from './components/select-account';
import type { SelectAccountEvent } from './components/select-account-button';

type Claim = RouterOutputs['seasonReward']['getUserSeasonRewardClaims'][number];

export default function SeasonRewardDetailPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const utils = api.useUtils();
  const [selectedAccount, setSelectedAccount] = useState<
    SelectAccountEvent | undefined
  >(undefined);
  const [isAwaitingClaim, setIsAwaitingClaim] = useState(false);
  const lastClaimSubmittedAt = useRef<number | null>(null);
  const POLLING_GRACE_PERIOD_MS = 10_000;
  const { data: seasons, isLoading: seasonsLoading } =
    api.season.getSeasons.useQuery();
  const router = useRouter();

  const { data: seasonReward, isLoading: seasonRewardsLoading } =
    api.seasonReward.getUserSeasonReward.useQuery({ seasonId });

  const { mutateAsync: claimSeasonReward } =
    api.seasonReward.requestSeasonRewardClaim.useMutation();

  const { data: claims, isLoading: claimsLoading } =
    api.seasonReward.getUserSeasonRewardClaims.useQuery(
      { seasonId },
      {
        refetchInterval: (query) => {
          const hasPendingClaim = query.state.data?.some(
            (claim) => claim.status === 'pending',
          );
          const isWithinGracePeriod =
            lastClaimSubmittedAt.current !== null &&
            Date.now() - lastClaimSubmittedAt.current < POLLING_GRACE_PERIOD_MS;
          return hasPendingClaim || isWithinGracePeriod ? 5000 : false;
        },
      },
    );
  const claimsList = pipe(
    Option.fromNullable(claims),
    Option.getOrElse(() => A.empty<Claim>()),
  );
  const season = pipe(
    Option.fromNullable(seasons),
    Option.flatMap(A.findFirst((s) => s.id === seasonId)),
    Option.getOrUndefined,
  );
  const hasPendingClaim = claimsList.some((c) => c.status === 'pending');
  const claimsCountRef = useRef(claimsList.length);

  // Clear awaiting state when a new claim appears
  useEffect(() => {
    if (isAwaitingClaim && claimsList.length > claimsCountRef.current) {
      setIsAwaitingClaim(false);
    }
    claimsCountRef.current = claimsList.length;
  }, [claimsList.length, isAwaitingClaim]);

  const claimedAmount = claimsList.reduce(
    (acc, claim) => (claim.status === 'success' ? acc.plus(claim.amount) : acc),
    new BigNumber(0),
  );

  const rewardAmount = pipe(
    Option.fromNullable(seasonReward),
    Option.map((reward) => new BigNumber(reward.amount)),
    Option.getOrElse(() => new BigNumber(0)),
  );
  const remainingAmount = rewardAmount.minus(claimedAmount).toString();
  const isFullyClaimed = new BigNumber(remainingAmount).isLessThanOrEqualTo(0);

  // Get the most recent claim timestamp for cooldown calculation
  // Claims are ordered by createdAt descending, so the first item is the latest
  const lastClaimAt = pipe(
    A.head(claimsList),
    Option.map((claim) => claim.createdAt),
    Option.getOrNull,
  );

  if (!seasonRewardsLoading && !seasonReward) {
    // empty state
    return (
      <div>
        <EmptyState
          title="Season reward not found"
          description="Check the season ID and try again or go back to the season rewards page."
          action={{
            label: 'Back to Season Rewards',
            onClick: () => router.push('/dashboard/season-reward'),
          }}
        />
      </div>
    );
  }

  const handleClaimSeasonReward = async (amount: Amount) => {
    if (!selectedAccount) {
      toast.error('Please select an account to claim the season reward');
      return;
    }
    try {
      await claimSeasonReward({
        amount,
        seasonId: SeasonId.make(seasonId),
        proof: selectedAccount.proof,
        challenge: selectedAccount.proof.challenge,
      });
      toast.success('Claim request submitted successfully');
      lastClaimSubmittedAt.current = Date.now();
      setIsAwaitingClaim(true);
      setSelectedAccount(undefined);
      utils.seasonReward.getUserSeasonRewardClaims.invalidate();
      utils.seasonReward.getUserSeasonReward.invalidate();
    } catch (error) {
      if (error instanceof TRPCClientError) {
        if (error.data?.errorCode === 'INVALID_CHALLENGE') {
          setSelectedAccount(undefined);
          toast.error('Account proof expired or invalid. Please try again.');
          return;
        }
      }

      toast.error(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  };

  return (
    <div>
      <PageHeader onBackClick={() => router.back()}>
        Claim Season Reward
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-10">
        <Card noHover className="flex flex-col gap-2 pt-4 sm:col-span-5">
          <CardContent className="flex flex-col gap-2">
            <AnimatePresence mode="wait">
              {!selectedAccount ? (
                <SlideIn key="account-selection">
                  <SelectAccount
                    onSelectAccount={setSelectedAccount}
                    hasPendingClaim={hasPendingClaim || isAwaitingClaim}
                    isFullyClaimed={isFullyClaimed}
                    lastClaimAt={lastClaimAt}
                  />
                </SlideIn>
              ) : (
                <SlideIn key="claim-form">
                  <RequestClaimForm
                    selectedAccount={selectedAccount}
                    onClearAccount={() => setSelectedAccount(undefined)}
                    availableAmount={remainingAmount}
                    onRequestClaim={handleClaimSeasonReward}
                  />
                </SlideIn>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 sm:col-span-5">
          <SeasonRewardCard
            seasonName={pipe(
              Option.fromNullable(season),
              Option.map((s) => s.name),
              Option.getOrElse(() => 'Unknown Season'),
            )}
            amount={pipe(
              Option.fromNullable(seasonReward),
              Option.map((reward) => reward.amount),
              Option.getOrElse(() => '0'),
            )}
            claims={claimsList}
          />
          <ClaimTransactionList
            claims={claimsList}
            isLoading={claimsLoading}
            isAwaitingClaim={isAwaitingClaim}
          />
        </div>
      </div>
    </div>
  );
}

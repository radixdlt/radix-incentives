'use client';
import { TRPCClientError } from '@trpc/client';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { type Amount, SeasonId } from 'shared/brandedTypes';
import { toast } from 'sonner';
import { Card, CardContent } from '~/components/ui/card';
import { EmptyState } from '~/components/ui/empty-state';
import { api } from '~/trpc/react';
import { SeasonRewardCard } from '../components/season-reward-card';
import { PageHeader } from './components/page-header';
import { RequestClaimForm } from './components/request-claim-form';
import { SelectAccount } from './components/select-account';
import type { SelectAccountEvent } from './components/select-account-button';

export default function SeasonRewardDetailPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [selectedAccount, setSelectedAccount] = useState<
    SelectAccountEvent | undefined
  >(undefined);
  const { data: seasons, isLoading: seasonsLoading } =
    api.season.getSeasons.useQuery();
  const router = useRouter();

  const { data: seasonRewards, isLoading: seasonRewardsLoading } =
    api.seasonReward.getUserSeasonRewards.useQuery();

  const { mutateAsync: claimSeasonReward } =
    api.seasonReward.requestSeasonRewardClaim.useMutation();

  const seasonReward = seasonRewards?.find(
    (reward) => reward.seasonId === seasonId,
  );
  const season = seasons?.find((s) => s.id === seasonId);

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

  const SlideIn = ({
    children,
    key,
  }: {
    children: React.ReactNode;
    key: string;
  }) => {
    return (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {children}
      </motion.div>
    );
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
                  <SelectAccount onSelectAccount={setSelectedAccount} />
                </SlideIn>
              ) : (
                <SlideIn key="claim-form">
                  <RequestClaimForm
                    selectedAccount={selectedAccount}
                    onClearAccount={() => setSelectedAccount(undefined)}
                    availableAmount={seasonReward?.amount ?? '0'}
                    onRequestClaim={handleClaimSeasonReward}
                  />
                </SlideIn>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="sm:col-span-5">
          <SeasonRewardCard
            seasonName={season?.name ?? 'Unknown Season'}
            amount={seasonReward?.amount ?? '0'}
            claims={[]}
          />
        </div>
      </div>
    </div>
  );
}

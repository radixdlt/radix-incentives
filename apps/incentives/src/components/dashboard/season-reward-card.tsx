import { Target, TrendingUp, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { getTokenLogo } from '~/lib/utils';
import { api } from '~/trpc/react';
import { MilestoneProgress } from './milestone-progress';

interface SeasonRewardCardProps {
  seasonId: string;
}

export const SeasonRewardCard = ({ seasonId }: SeasonRewardCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  // Fetch milestone progress data
  const {
    data: milestoneData,
    isLoading,
    isError,
  } = api.milestones.getMilestoneProgress.useQuery({
    seasonId,
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatXrd = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    }
    return value.toLocaleString();
  };

  const actualMilestoneData = milestoneData;

  // Calculate total reward pool from milestones
  const baseReward = 100000000; // 100M XRD base
  const bonusReward = actualMilestoneData
    ? Object.values(actualMilestoneData).reduce(
        (total, category) =>
          total +
          (category?.milestones?.filter(
            (m: { achieved?: boolean }) => m?.achieved,
          )?.length ?? 0) *
            10000000,
        0,
      )
    : 0;
  const totalReward = baseReward + bonusReward;

  if (isLoading || isError || !actualMilestoneData) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">Season 1 Reward Pool</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Image
                src={getTokenLogo('xrd')}
                alt="XRD"
                width={48}
                height={48}
                className="h-8 w-8 rounded-full border border-white/20"
                quality={100}
                priority
              />
              <div className="gradient-text font-bold text-3xl">
                {formatXrd(baseReward)} XRD
              </div>
            </div>
            <div className="text-muted-foreground text-sm">
              Base: {formatXrd(baseReward)} XRD + Community Milestones
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(true)}
            className="w-full"
          >
            View Milestones
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Season 1 Reward Pool</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Image
                src={getTokenLogo('xrd')}
                alt="XRD"
                width={48}
                height={48}
                className="h-8 w-8 rounded-full border border-white/20"
                quality={100}
                priority
              />
              <div className="gradient-text font-bold text-3xl">
                {formatXrd(totalReward)} XRD
              </div>
            </div>
            <div className="text-muted-foreground text-sm">
              Base: {formatXrd(baseReward)} XRD + Community Milestones
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(true)}
            className="w-full"
          >
            View Milestones
          </Button>
        </div>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="mx-auto max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Season 1 Community Milestones
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="rounded-lg bg-card p-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Season 1 of Radix Rewards starts with a baseline pool of{' '}
                <span className="font-semibold text-foreground">
                  100 million XRD
                </span>
                . Up to another{' '}
                <span className="font-semibold text-foreground">
                  100 million XRD
                </span>{' '}
                can be unlocked through ecosystem milestones achieved together
                as a community.
              </p>
            </div>

            {actualMilestoneData && (
              <div className="grid gap-4 md:grid-cols-2">
                <MilestoneProgress
                  title="Total Value Locked"
                  icon={TrendingUp}
                  iconColor="text-green-500"
                  currentValue={actualMilestoneData.tvl?.current ?? 0}
                  unit=""
                  milestones={actualMilestoneData.tvl?.milestones ?? []}
                  formatValue={formatCurrency}
                />

                <MilestoneProgress
                  title="Weekly Transactions"
                  icon={TrendingUp}
                  iconColor="text-blue-500"
                  currentValue={actualMilestoneData.transactions?.current ?? 0}
                  unit=""
                  milestones={
                    actualMilestoneData.transactions?.milestones ?? []
                  }
                  formatValue={(value) => `${(value / 1000).toFixed(0)}K`}
                />

                <MilestoneProgress
                  title="DEX Volume"
                  icon={TrendingUp}
                  iconColor="text-purple-500"
                  currentValue={actualMilestoneData.dex_volume?.current ?? 0}
                  unit=""
                  milestones={actualMilestoneData.dex_volume?.milestones ?? []}
                  formatValue={formatCurrency}
                />

                <MilestoneProgress
                  title="Wallet Downloads"
                  icon={TrendingUp}
                  iconColor="text-orange-500"
                  currentValue={
                    actualMilestoneData.wallet_downloads?.current ?? 0
                  }
                  unit=""
                  milestones={
                    actualMilestoneData.wallet_downloads?.milestones ?? []
                  }
                  formatValue={(value) => `${(value / 1000).toFixed(0)}K`}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

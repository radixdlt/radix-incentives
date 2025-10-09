import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  GradientButton,
  GradientText,
  StarBackground,
} from '~/components/shared';
import { Card } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { api } from '~/trpc/react';
import { MilestoneProgress } from './milestone-progress';

interface RadixRewardsIntroProps {
  seasonId?: string;
}

export const RadixRewardsIntro = ({ seasonId }: RadixRewardsIntroProps) => {
  const [showMilestones, setShowMilestones] = useState(false);

  // Fetch milestone progress data
  const {
    data: milestoneData,
    isLoading,
    isError,
  } = api.milestones.getMilestoneProgress.useQuery(
    {
      seasonId: seasonId || '',
    },
    {
      enabled: !!seasonId,
    },
  );

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  // Calculate total reward pool from milestones
  const baseReward = 100000000; // 100M XRD base
  const maxBonusReward = 100000000; // 100M XRD max bonus
  const achievedMilestones = milestoneData
    ? Object.values(milestoneData).reduce(
        (total, category) =>
          total +
          (category?.milestones?.filter(
            (m: { achieved?: boolean }) => m?.achieved,
          )?.length ?? 0),
        0,
      )
    : 0;
  const bonusReward = achievedMilestones * 10000000;
  const totalReward = baseReward + bonusReward;
  const remainingBonusReward = maxBonusReward - bonusReward;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Card - Radix Rewards Info */}
        <Card
          noHover
          className="relative flex items-center overflow-hidden border-0 bg-black/70 p-0 lg:col-span-2"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(175deg, rgba(255, 67, 202, 0.7) 0%, rgba(0, 0, 0, 0.5) 50%)',
            }}
          />
          <StarBackground variant="left" opacity={0.5} />
          <div className="relative z-10 w-full p-8">
            <div className="mb-8 space-y-1">
              <h1
                className="font-bold text-[1.75rem] tracking-wider md:text-[3.5rem]"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6))' }}
              >
                <GradientText>Radix Rewards</GradientText>
              </h1>
              <p
                className="text-base leading-relaxed md:text-lg"
                style={{ color: '#ffe6f7' }}
              >
                Unleash the 1B XRD Radix Rewards Campaign—Earn Big, Grow
                Together.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-3">
                <p className="font-medium text-sm" style={{ color: '#f7c2e8' }}>
                  New to Radix? Get accustomed:
                </p>
                <div className="flex flex-col items-start gap-3 sm:flex-row">
                  <GradientButton
                    variant="secondary"
                    href="https://radquest.io/home/basic"
                    external
                  >
                    RadQuest
                  </GradientButton>
                  <GradientButton
                    variant="secondary"
                    href="https://radixdlt.com"
                    external
                  >
                    About Radix
                  </GradientButton>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-medium text-sm" style={{ color: '#f7c2e8' }}>
                  Familiar? Use the network:
                </p>
                <Link href="/dashboard/earn">
                  <GradientButton variant="primary">
                    Start Earning
                  </GradientButton>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Card - Season 1 Rewards */}
        <Card
          noHover
          className="relative flex items-center overflow-hidden border-0 bg-black/50 p-0"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, #D636A1 0%, rgba(0, 0, 0, 0.8) 100%)',
            }}
          />
          <StarBackground variant="center" opacity={0.7} />
          <div className="relative z-10 w-full space-y-6 p-8 text-white">
            <div className="text-center">
              <h2
                className="mb-6 font-bold text-3xl"
                style={{ color: 'white' }}
              >
                Season 1
              </h2>
              <div className="my-auto">
                <div
                  className="font-black text-[#20E4FF] text-[5.1rem]"
                  style={{
                    WebkitTextStroke: '0.5px white',
                    textShadow: '0 8px 16px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  {isLoading ? '100M' : `${Math.round(totalReward / 1000000)}M`}
                </div>
              </div>
              <div className="-mt-4">
                <div className="font-bold text-3xl">
                  <GradientText withDropShadow>XRD</GradientText>
                </div>
                <p className="font-bold text-2xl">
                  <GradientText withDropShadow>
                    + {Math.round(remainingBonusReward / 1000000)}M Extra
                    Milestones
                  </GradientText>
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <GradientButton
                variant="secondary"
                onClick={() => setShowMilestones(true)}
              >
                DISCOVER
              </GradientButton>
            </div>
          </div>
        </Card>
      </div>

      {/* Milestones Dialog */}
      <Dialog open={showMilestones} onOpenChange={setShowMilestones}>
        <DialogContent className="mx-auto max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
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

            {milestoneData && (
              <div className="grid gap-4 md:grid-cols-2">
                <MilestoneProgress
                  title="Total Value Locked"
                  icon={ExternalLink}
                  iconColor="text-green-500"
                  currentValue={milestoneData.tvl?.current ?? 0}
                  unit=""
                  milestones={milestoneData.tvl?.milestones ?? []}
                  formatValue={formatCurrency}
                />

                <MilestoneProgress
                  title="Weekly Transactions"
                  icon={ExternalLink}
                  iconColor="text-blue-500"
                  currentValue={milestoneData.transactions?.current ?? 0}
                  unit=""
                  milestones={milestoneData.transactions?.milestones ?? []}
                  formatValue={(value) => `${(value / 1000).toFixed(0)}K`}
                />

                <MilestoneProgress
                  title="DEX Volume"
                  icon={ExternalLink}
                  iconColor="text-purple-500"
                  currentValue={milestoneData.dex_volume?.current ?? 0}
                  unit=""
                  milestones={milestoneData.dex_volume?.milestones ?? []}
                  formatValue={formatCurrency}
                />

                <MilestoneProgress
                  title="Wallet Downloads"
                  icon={ExternalLink}
                  iconColor="text-orange-500"
                  currentValue={milestoneData.wallet_downloads?.current ?? 0}
                  unit=""
                  milestones={milestoneData.wallet_downloads?.milestones ?? []}
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

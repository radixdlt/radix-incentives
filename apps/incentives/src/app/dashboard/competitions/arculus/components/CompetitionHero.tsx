import { Coins } from 'lucide-react';
import Image from 'next/image';
import type { FC } from 'react';
import { Button } from '~/components/ui/button';

type CompetitionHeroProps = {
  prizeCount: number;
  isActive: boolean;
  xrdBalance?: string;
  showXrdHoldings?: boolean;
  onParticipate?: () => void;
  isParticipating?: boolean;
  isParticipant?: boolean;
  isLoading?: boolean;
};

export const CompetitionHero: FC<CompetitionHeroProps> = ({
  prizeCount,
  isActive,
  xrdBalance = '2,545.50',
  showXrdHoldings = true,
  onParticipate,
  isParticipating = false,
  isParticipant = false,
  isLoading = false,
}) => {
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        {/* Left Column: Title and Description */}
        <div className="flex flex-col gap-4">
          <div className="items-center gap-3 sm:flex">
            <Image
              className="mb-5 sm:mb-0"
              src="/assets/arculuscard.webp"
              alt="Arculus Card"
              width={100}
              height={100}
            />
            <div>
              <h1 className="font-bold text-3xl text-white tracking-tight">
                Win a Radix Branded Arculus Card
              </h1>
              <p className="text-white/70">Secure your crypto with style</p>
            </div>
          </div>

          <p className="max-w-2xl text-lg text-white/80">
            Compete for a chance to win one of {prizeCount} exclusive Radix
            branded Arculus hardware wallet cards. Winners will be randomly
            selected based on XRD holdings.{' '}
            <span className="font-bold text-white">
              The more XRD you hold, the higher your chances of being selected
              as a winner.
            </span>
          </p>
        </div>

        {/* Right Column: XRD Holdings (top) and Join Button (bottom) */}
        {showXrdHoldings || (isActive && onParticipate) ? (
          <div className="flex flex-col items-end justify-between gap-6 sm:flex-row sm:items-end sm:gap-4 lg:flex-col lg:gap-0">
            {/* XRD Holdings */}
            {showXrdHoldings && (
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/20 p-3">
                  <Coins className="h-5 w-5 text-orange-400" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/70">Your XRD Holdings</div>
                  <div className="font-bold text-2xl text-white">
                    {xrdBalance}
                  </div>
                </div>
              </div>
            )}

            {/* Join Competition Button */}
            {isActive && onParticipate && (
              <Button
                onClick={onParticipate}
                disabled={isParticipating || isLoading || isParticipant}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 sm:w-auto lg:w-full"
              >
                {isParticipant
                  ? 'Joined'
                  : isParticipating
                    ? 'Joining...'
                    : 'Join Competition'}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

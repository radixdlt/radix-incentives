import Image from 'next/image';
import type { FC } from 'react';
import { Badge } from '~/components/ui/badge';

type CompetitionHeroProps = {
  prizeCount: number;
  isActive: boolean;
};

export const CompetitionHero: FC<CompetitionHeroProps> = ({
  prizeCount,
  isActive,
}) => {
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
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
              selected based on XRD holdings. The more XRD you hold, the higher
              your chances of being selected as a winner.
            </p>
          </div>

          {isActive ? (
            <Badge className="bg-green-500/20 px-4 py-2 font-semibold text-green-400">
              Active
            </Badge>
          ) : (
            <Badge className="bg-gray-500/20 px-4 py-2 font-semibold text-gray-400">
              Ended
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

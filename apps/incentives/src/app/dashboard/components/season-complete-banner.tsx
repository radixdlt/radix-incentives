'use client';

import Link from 'next/link';
import {
  GradientButton,
  GradientText,
  StarBackground,
} from '~/components/shared';
import { Card } from '~/components/ui/card';

type SeasonCompleteBannerProps = {
  seasonName: string;
};

export const SeasonCompleteBanner = ({
  seasonName,
}: SeasonCompleteBannerProps) => {
  return (
    <Card
      noHover
      className="relative flex items-center overflow-hidden border-0 bg-black/70 p-0"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(175deg, #1a6b3d 0%, rgba(0, 0, 0, 0.5) 50%)',
        }}
      />
      <StarBackground variant="left" opacity={0.5} />
      <div className="relative z-10 w-full p-8">
        <div className="mb-6 space-y-2">
          <h1
            className="font-bold text-[1.75rem] tracking-wider md:text-[3rem]"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6))' }}
          >
            <GradientText>{seasonName} Complete</GradientText>
          </h1>
          <p
            className="text-base leading-relaxed md:text-lg"
            style={{ color: '#c2f7d6' }}
          >
            Thank you for participating in {seasonName}! Your rewards are ready
            to claim.
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <Link href="/dashboard/season-reward">
            <GradientButton variant="primary">
              Claim Your Rewards
            </GradientButton>
          </Link>
          <Link href="/dashboard/leaderboard">
            <GradientButton variant="secondary">View Rankings</GradientButton>
          </Link>
        </div>
      </div>
    </Card>
  );
};

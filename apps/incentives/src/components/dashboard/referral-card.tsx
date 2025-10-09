'use client';
import { Gift } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { ShareButton } from './share-button';

type ReferralCardProps = {
  referralCode?: string;
  numberOfReferrals?: number;
  isLoading: boolean;
};

export function ReferralCard({
  referralCode,
  numberOfReferrals,
  isLoading,
}: ReferralCardProps) {
  const referralLink = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${referralCode}`
    : '';

  if (isLoading) {
    return (
      <Card className="group overflow-hidden" noHover>
        <div className="flex flex-col space-y-4 p-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-white/80">Referrals</span>
            <Gift className="h-5 w-5 text-purple-400" />
          </div>

          <div className="flex items-end gap-3">
            <div className="h-10 w-16 animate-pulse rounded bg-white/20" />
          </div>

          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden" noHover>
      <div className="flex flex-col space-y-4 p-6">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-white/80">Referrals</span>
          <Gift className="h-5 w-5 text-[#FF43CA]" />
        </div>

        <div className="flex items-end gap-3">
          <span className="gradient-text font-bold text-4xl tracking-tight">
            {numberOfReferrals || 0}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-white/60">Users you've referred</div>
          <ShareButton referralLink={referralLink} size="sm" />
        </div>
      </div>
    </Card>
  );
}

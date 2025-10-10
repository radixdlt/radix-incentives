'use client';
import { ShareButton } from '~/components/dashboard/share-button';

export function ReferralStats({
  referralCode,
  numberOfReferrals,
  referralPoints,
  isLoading,
  percentage,
}: {
  referralCode?: string;
  numberOfReferrals?: number;
  referralPoints?: string;
  percentage?: number;
  isLoading: boolean;
}) {
  const formatPoints = (points: string) => {
    const num = Number.parseFloat(points);
    if (Number.isNaN(num)) {
      return '0';
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const referralLink = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${referralCode}`
    : '';

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Loading skeleton for main stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="glass-card col-span-2 rounded-lg p-3 text-center sm:col-span-1 sm:p-4">
            <div className="mb-2 font-medium text-sm text-white/80">
              Your Referral Points
            </div>
            <div className="mx-auto h-8 w-24 animate-pulse rounded bg-white/20 sm:h-10 sm:w-32" />
          </div>

          <div className="glass-card col-span-2 rounded-lg p-3 text-center sm:col-span-1 sm:p-4">
            <div className="mb-2 font-medium text-sm text-white/80">
              Number of Referrals
            </div>
            <div className="mx-auto h-8 w-16 animate-pulse rounded bg-white/20 sm:h-10 sm:w-20" />
          </div>
        </div>

        {/* Loading skeleton for referral code */}
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg border bg-card p-3 sm:p-4">
            <h4 className="mb-2 font-medium text-sm sm:text-base">
              Referral code
            </h4>
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 animate-pulse rounded bg-muted" />
              <div className="h-6 w-6 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-1 text-muted-foreground text-xs sm:text-sm">
              Share your referral link to earn points. You earn 5% of the
              referred user's season points.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Stats Grid - Better mobile layout */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="glass-card col-span-2 rounded-lg p-3 text-center sm:col-span-1 sm:p-4">
          <div className="mb-2 font-medium text-sm text-white/80">
            Your Referral Points
          </div>
          <div className="gradient-text font-bold text-2xl text-white tracking-tight sm:text-4xl">
            {formatPoints(referralPoints || '0')}
          </div>
        </div>

        <div className="glass-card col-span-2 rounded-lg p-3 text-center sm:col-span-1 sm:p-4">
          <div className="mb-2 font-medium text-sm text-white/80">
            Number of Referrals
          </div>
          <div className="gradient-text font-bold text-2xl text-white tracking-tight sm:text-4xl">
            {numberOfReferrals || 0}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <h4 className="mb-2 font-medium text-sm sm:text-base">
            Referral code
          </h4>
          <div className="flex items-center gap-4">
            <div className="font-semibold text-base sm:text-lg">
              {referralCode}
            </div>
            <ShareButton referralLink={referralLink} size="lg" />
          </div>
          <div className="mt-2 text-muted-foreground text-xs sm:text-sm">
            Share your referral link to earn points. You earn{' '}
            {percentage ? percentage * 100 : 0}% of the referred user's season
            points.
          </div>
        </div>
      </div>
    </div>
  );
}

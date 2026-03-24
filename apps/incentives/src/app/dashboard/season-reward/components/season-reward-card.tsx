import BigNumber from 'bignumber.js';
import {
  Ban,
  CheckCircle,
  Clock,
  Coins,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { formatAmount } from '../helpers/formatAmount';

type Claim = {
  amount: string;
  status: string;
};

type VesterInfo = {
  currentValuePerUnit: string;
  maturityValuePerUnit: string;
};

export type SeasonRewardCardProps = {
  seasonId: string;
  seasonName: string;
  amount: string;
  claims: Claim[];
  onClaim?: () => void;
  showRedeem?: boolean;
  hasReward?: boolean;
  claimingEnabled?: boolean;
  vesterInfo?: VesterInfo;
};

type ClaimStatus = 'unclaimed' | 'partial' | 'claimed' | 'pending';
type DisplayStatus = ClaimStatus | 'claim-period-ended';

const getClaimStatus = (
  amount: string,
  claims: { amount: string; status: string }[],
): { status: ClaimStatus; claimedAmount: BigNumber } => {
  const totalAmount = new BigNumber(amount);
  const claimedAmount = claims.reduce((acc, claim) => {
    if (claim.status === 'success') {
      return acc.plus(claim.amount);
    }
    return acc;
  }, new BigNumber(0));

  const hasPending = claims.some((claim) => claim.status === 'pending');

  if (hasPending) {
    return { status: 'pending', claimedAmount };
  }
  if (claimedAmount.gte(totalAmount)) {
    return { status: 'claimed', claimedAmount };
  }
  if (claimedAmount.gt(0)) {
    return { status: 'partial', claimedAmount };
  }
  return { status: 'unclaimed', claimedAmount };
};

const ClaimStatusBadge = ({
  status,
  claimingEnabled = true,
}: {
  status: ClaimStatus;
  claimingEnabled?: boolean;
}) => {
  const config: Record<
    DisplayStatus,
    { icon: typeof Ban; label: string; className: string }
  > = {
    unclaimed: {
      icon: XCircle,
      label: 'Unclaimed',
      className: 'bg-red-500/20 text-red-200 border-red-500/30',
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    },
    partial: {
      icon: Clock,
      label: 'Partially Claimed',
      className: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
    },
    claimed: {
      icon: CheckCircle,
      label: 'Claimed',
      className: 'bg-green-500/20 text-green-200 border-green-500/30',
    },
    'claim-period-ended': {
      icon: Ban,
      label: 'Closed',
      className: 'bg-white/5 text-white/40 border-white/10',
    },
  };

  const displayKey: DisplayStatus =
    !claimingEnabled && status !== 'claimed' ? 'claim-period-ended' : status;
  const { icon: Icon, label, className } = config[displayKey];

  return (
    <Badge
      variant="outline"
      className={cn('flex items-center gap-1.5 font-medium text-xs', className)}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export const SeasonRewardCard = ({
  seasonId,
  seasonName,
  amount,
  claims,
  onClaim,
  showRedeem = false,
  hasReward = true,
  claimingEnabled = true,
  vesterInfo,
}: SeasonRewardCardProps) => {
  const { status, claimedAmount } = getClaimStatus(amount, claims);
  const remainingAmount = new BigNumber(amount).minus(claimedAmount);

  // Show "no reward" state when hasReward is false
  const displayStatus = hasReward ? status : 'unclaimed';

  // Calculate XRD values if vesterInfo is available
  const currentXrdValue =
    hasReward && vesterInfo
      ? new BigNumber(amount).multipliedBy(vesterInfo.currentValuePerUnit)
      : null;
  const maturityXrdValue =
    hasReward && vesterInfo
      ? new BigNumber(amount).multipliedBy(vesterInfo.maturityValuePerUnit)
      : null;

  return (
    <Card className="p-6" noHover>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-white/80">
            {seasonName}
          </span>
          {hasReward ? (
            <ClaimStatusBadge
              status={displayStatus}
              claimingEnabled={claimingEnabled}
            />
          ) : (
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 bg-white/5 font-medium text-white/40 text-xs"
            >
              No Reward
            </Badge>
          )}
        </div>

        <div>
          <div
            className={cn(
              'flex items-baseline gap-2 font-bold text-3xl',
              hasReward ? 'gradient-text' : 'text-white/40',
            )}
          >
            {hasReward ? formatAmount(amount) : '—'}
            {hasReward && (
              <span className="font-medium text-base text-white/60">
                Reward Pool Units
              </span>
            )}
          </div>
          {/* XRD Values inline */}
          {hasReward && vesterInfo && currentXrdValue && maturityXrdValue && (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="text-white/50">Worth</span>
              <span className="text-green-400">
                {formatAmount(currentXrdValue.toString())} XRD
              </span>
              <span className="text-white/30">→</span>
              <span className="flex items-center gap-1 text-blue-400">
                <TrendingUp className="h-3 w-3" />
                {formatAmount(maturityXrdValue.toString())} XRD
              </span>
              <span className="text-white/40">at maturity</span>
            </div>
          )}
        </div>

        {!claimingEnabled && hasReward && status !== 'claimed' ? (
          <div className="flex items-center gap-2 rounded-lg bg-white/5 p-3 text-white/60 text-sm">
            <Ban className="h-4 w-4 shrink-0" />
            <span>The claiming period for this season has ended.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-white/5 p-3">
            <div>
              <div className="text-white/60 text-xs">Claimed</div>
              <div
                className={cn(
                  'font-semibold',
                  hasReward ? 'text-green-400' : 'text-white/40',
                )}
              >
                {hasReward ? formatAmount(claimedAmount.toString()) : '—'}
              </div>
            </div>
            <div>
              <div className="text-white/60 text-xs">Claimable</div>
              <div
                className={cn(
                  'font-semibold',
                  hasReward ? 'text-white' : 'text-white/40',
                )}
              >
                {hasReward ? formatAmount(remainingAmount.toString()) : '—'}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {onClaim !== undefined && (
            <>
              {hasReward && onClaim ? (
                <Button type="button" className="flex-1" onClick={onClaim}>
                  Claim
                </Button>
              ) : (
                <Button
                  type="button"
                  className="flex-1"
                  disabled
                  variant="outline"
                >
                  Claim
                </Button>
              )}
            </>
          )}
          {showRedeem && (
            <Button type="button" variant="outline" className="flex-1" asChild>
              <Link href={`/dashboard/season-reward/redeem/${seasonId}`}>
                <Coins className="mr-2 h-4 w-4" />
                Redeem
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

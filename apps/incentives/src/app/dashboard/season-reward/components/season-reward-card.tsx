import BigNumber from 'bignumber.js';
import { CheckCircle, Clock, Coins, XCircle } from 'lucide-react';
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

type SeasonRewardCardProps = {
  seasonId: string;
  seasonName: string;
  amount: string;
  claims: Claim[];
  onClaim?: () => void;
  showRedeem?: boolean;
  hasReward?: boolean;
};

type ClaimStatus = 'unclaimed' | 'partial' | 'claimed' | 'pending';

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

const ClaimStatusBadge = ({ status }: { status: ClaimStatus }) => {
  const config = {
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
  };

  const { icon: Icon, label, className } = config[status];

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
}: SeasonRewardCardProps) => {
  const { status, claimedAmount } = getClaimStatus(amount, claims);
  const remainingAmount = new BigNumber(amount).minus(claimedAmount);

  // Show "no reward" state when hasReward is false
  const displayStatus = hasReward ? status : 'unclaimed';

  return (
    <Card className="p-6" noHover>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-white/80">
            {seasonName}
          </span>
          {hasReward ? (
            <ClaimStatusBadge status={displayStatus} />
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
              'font-bold text-3xl',
              hasReward ? 'gradient-text' : 'text-white/40',
            )}
          >
            {hasReward ? formatAmount(amount) : '—'}
          </div>
          <div className="text-sm text-white/60">Total Reward</div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-white/10 border-t pt-4">
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

import BigNumber from 'bignumber.js';
import { Award, CheckCircle, Clock, Coins } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { formatAmount } from '../helpers/formatAmount';

type Claim = {
  amount: string;
  status: string;
};

type SeasonRewardCardProps = {
  seasonName: string;
  amount: string;
  claims: Claim[];
  onClaim?: () => void;
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
      icon: Coins,
      label: 'Unclaimed',
      className: 'bg-white/10 text-white/80',
    },
    pending: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-500/20 text-yellow-400',
    },
    partial: {
      icon: Award,
      label: 'Partially Claimed',
      className: 'bg-blue-500/20 text-blue-400',
    },
    claimed: {
      icon: CheckCircle,
      label: 'Claimed',
      className: 'bg-green-500/20 text-green-400',
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-xs ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
};

export const SeasonRewardCard = ({
  seasonName,
  amount,
  claims,
  onClaim,
}: SeasonRewardCardProps) => {
  const { status, claimedAmount } = getClaimStatus(amount, claims);
  const remainingAmount = new BigNumber(amount).minus(claimedAmount);

  return (
    <Card className="p-6" noHover>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-white/80">
            {seasonName}
          </span>
          <ClaimStatusBadge status={status} />
        </div>

        <div>
          <div className="gradient-text font-bold text-3xl">
            {formatAmount(amount)}
          </div>
          <div className="text-sm text-white/60">Total Reward</div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-white/10 border-t pt-4">
          <div>
            <div className="text-white/60 text-xs">Claimed</div>
            <div className="font-semibold text-green-400">
              {formatAmount(claimedAmount.toString())}
            </div>
          </div>
          <div>
            <div className="text-white/60 text-xs">Claimable</div>
            <div className="font-semibold text-white">
              {formatAmount(remainingAmount.toString())}
            </div>
          </div>
        </div>

        {onClaim && (
          <Button type="button" className="w-full" onClick={onClaim}>
            Claim
          </Button>
        )}
      </div>
    </Card>
  );
};

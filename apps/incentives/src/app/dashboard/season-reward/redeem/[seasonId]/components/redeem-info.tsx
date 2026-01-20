import BigNumber from 'bignumber.js';
import { Clock, Coins, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { formatAmount } from '../../../helpers/formatAmount';

type VesterInfo = {
  poolUnitResourceAddress: string;
  poolAddress: string;
  currentValuePerUnit: string;
  maturityValuePerUnit: string;
  vestEndTimestamp: string | null;
};

type RedeemInfoProps = {
  vesterInfo?: VesterInfo;
  totalBalance: string;
  isLoading: boolean;
};

const formatTimeRemaining = (vestEndTimestamp: string | null): string => {
  if (!vestEndTimestamp) return 'No maturity date set';

  const vestEnd = new Date(vestEndTimestamp);
  const now = new Date();
  const diff = vestEnd.getTime() - now.getTime();

  if (diff <= 0) return 'Matured';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''}`;
};

const calculateCurrentValue = (
  balance: string,
  currentValuePerUnit: string,
): string => {
  const balanceBn = new BigNumber(balance);
  const valueBn = new BigNumber(currentValuePerUnit);
  return balanceBn.multipliedBy(valueBn).toString();
};

const calculateMaturityValue = (
  balance: string,
  maturityValuePerUnit: string,
): string => {
  const balanceBn = new BigNumber(balance);
  const valueBn = new BigNumber(maturityValuePerUnit);
  return balanceBn.multipliedBy(valueBn).toString();
};

const calculateEarlyRedemptionLoss = (
  currentValuePerUnit: string,
  maturityValuePerUnit: string,
): string => {
  const currentBn = new BigNumber(currentValuePerUnit);
  const maturityBn = new BigNumber(maturityValuePerUnit);

  if (maturityBn.isZero()) return '0';

  const loss = maturityBn
    .minus(currentBn)
    .dividedBy(maturityBn)
    .multipliedBy(100);
  return loss.toFixed(1);
};

export const RedeemInfo = ({
  vesterInfo,
  totalBalance,
  isLoading,
}: RedeemInfoProps) => {
  if (isLoading) {
    return (
      <Card className="p-6" noHover>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-white/10" />
          <div className="h-8 w-2/3 rounded bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-white/10" />
        </div>
      </Card>
    );
  }

  if (!vesterInfo) {
    return null;
  }

  const currentValue = calculateCurrentValue(
    totalBalance,
    vesterInfo.currentValuePerUnit,
  );
  const maturityValue = calculateMaturityValue(
    totalBalance,
    vesterInfo.maturityValuePerUnit,
  );
  const lossPercentage = calculateEarlyRedemptionLoss(
    vesterInfo.currentValuePerUnit,
    vesterInfo.maturityValuePerUnit,
  );
  const timeRemaining = formatTimeRemaining(vesterInfo.vestEndTimestamp);
  const isMatured = vesterInfo.vestEndTimestamp
    ? new Date(vesterInfo.vestEndTimestamp).getTime() <= Date.now()
    : false;

  return (
    <Card className="p-6" noHover>
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 font-bold text-lg">Reward Token Info</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-5 w-5 text-white/60" />
            <div>
              <div className="text-sm text-white/60">Your Balance</div>
              <div className="font-semibold text-white">
                {formatAmount(totalBalance)} LP Tokens
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Coins className="mt-0.5 h-5 w-5 text-green-400" />
            <div>
              <div className="text-sm text-white/60">Current XRD Value</div>
              <div className="font-semibold text-green-400">
                {formatAmount(currentValue)} XRD
              </div>
              <div className="text-white/40 text-xs">
                ({formatAmount(vesterInfo.currentValuePerUnit)} XRD per token)
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 h-5 w-5 text-blue-400" />
            <div>
              <div className="text-sm text-white/60">Maturity XRD Value</div>
              <div className="font-semibold text-blue-400">
                {formatAmount(maturityValue)} XRD
              </div>
              <div className="text-white/40 text-xs">
                ({formatAmount(vesterInfo.maturityValuePerUnit)} XRD per token)
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-white/60" />
            <div>
              <div className="text-sm text-white/60">Time Until Maturity</div>
              <div className="font-semibold text-white">{timeRemaining}</div>
            </div>
          </div>
        </div>

        {!isMatured && Number(lossPercentage) > 0 && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
            <div className="flex items-center gap-2 text-orange-400">
              <TrendingDown className="h-4 w-4" />
              <span className="font-medium text-sm">
                Early Redemption Warning
              </span>
            </div>
            <p className="mt-2 text-sm text-white/70">
              Redeeming now will result in approximately{' '}
              <span className="font-semibold text-orange-400">
                {lossPercentage}%
              </span>{' '}
              less XRD compared to waiting until maturity.
            </p>
          </div>
        )}

        {isMatured && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-center gap-2 text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium text-sm">Fully Matured</span>
            </div>
            <p className="mt-2 text-sm text-white/70">
              Your reward tokens have reached maturity. Redeem now to receive
              the full XRD value.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

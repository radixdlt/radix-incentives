'use client';

import BigNumber from 'bignumber.js';
import { Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { useSubmitTransaction } from '~/lib/hooks/useSubmitTransaction';
import { buildClaimFromLockerManifest } from '~/lib/manifests/claimFromLocker';
import { api } from '~/trpc/react';
import { formatAmount } from '../../helpers/formatAmount';

type LockerBalance = {
  accountAddress: string;
  balance: string;
};

type LockerClaimSectionProps = {
  lockerBalances: LockerBalance[];
  lockerAddress: string;
  poolUnitResourceAddress: string;
  onClaimSuccess: () => void;
};

const truncateAddress = (address: string) => {
  if (address.length <= 20) return address;
  return `${address.slice(0, 12)}...${address.slice(-6)}`;
};

export const LockerClaimSection = ({
  lockerBalances,
  lockerAddress,
  poolUnitResourceAddress,
  onClaimSuccess,
}: LockerClaimSectionProps) => {
  const { submitTransaction, isSubmitting } = useSubmitTransaction();
  const [claimingAccount, setClaimingAccount] = useState<string | null>(null);
  const utils = api.useUtils();

  if (lockerBalances.length === 0) {
    return null;
  }

  // Calculate total balance across all accounts
  const totalBalance = lockerBalances.reduce(
    (acc, item) => acc.plus(item.balance),
    new BigNumber(0),
  );

  const handleClaimFromLocker = async (
    accountAddress: string,
    balance: string,
  ) => {
    setClaimingAccount(accountAddress);
    try {
      const manifest = buildClaimFromLockerManifest({
        lockerAddress,
        accountAddress,
        resourceAddress: poolUnitResourceAddress,
        amount: balance,
      });

      const result = await submitTransaction({
        manifest,
        message: 'Claim rewards from locker',
      });

      if (result.success) {
        utils.seasonReward.getLockerBalances.invalidate();
        onClaimSuccess();
        toast.success('Rewards claimed from locker successfully!');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to claim from locker',
      );
    } finally {
      setClaimingAccount(null);
    }
  };

  return (
    <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 shrink-0 text-orange-400" />
          <p className="font-medium text-orange-300 text-sm">
            Rewards in Account Locker
          </p>
        </div>

        <p className="text-orange-200/70 text-xs">
          Some rewards were sent to an account locker because third-party
          deposits were disabled. Claim them below.
        </p>

        <div className="space-y-2">
          {lockerBalances.map((item) => (
            <div
              key={item.accountAddress}
              className="flex items-center justify-between gap-2 rounded border border-orange-500/20 bg-orange-500/5 px-3 py-2"
            >
              <div className="min-w-0 flex-1 overflow-hidden">
                <p
                  className="truncate font-mono text-orange-200 text-xs"
                  title={item.accountAddress}
                >
                  {truncateAddress(item.accountAddress)}
                </p>
                <p className="font-medium text-orange-300 text-sm">
                  {formatAmount(item.balance)} rewards
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleClaimFromLocker(item.accountAddress, item.balance)
                }
                disabled={isSubmitting || claimingAccount !== null}
                className="shrink-0 border-orange-500/30 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200"
              >
                {claimingAccount === item.accountAddress ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                <span className="ml-1.5">Claim</span>
              </Button>
            </div>
          ))}
        </div>

        {lockerBalances.length > 1 && (
          <p className="text-orange-200/50 text-xs">
            Total: {formatAmount(totalBalance.toString())} rewards across{' '}
            {lockerBalances.length} accounts
          </p>
        )}
      </div>
    </div>
  );
};

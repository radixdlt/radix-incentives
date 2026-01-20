import { Cause, Exit } from 'effect';
import { Wallet } from 'lucide-react';
import type { WalletAccount } from 'shared/schemas/walletAccount';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { useGetAccount } from '../../../hooks/getAccount';

export type WalletAccountEvent = {
  account: WalletAccount;
};

type WalletAccountSelectorProps = {
  onSelectAccount: (account: WalletAccountEvent) => void;
  seasonName: string;
};

export const WalletAccountSelector = ({
  onSelectAccount,
  seasonName,
}: WalletAccountSelectorProps) => {
  const { getAccount, isLoading } = useGetAccount();

  const handleSelectAccount = async () => {
    const exit = await getAccount();
    if (Exit.isFailure(exit)) {
      console.error(Cause.pretty(exit.cause));
      toast.error('Failed to select account');
    } else {
      toast.success('Account selected');
      onSelectAccount(exit.value);
    }
  };

  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <Wallet className="h-12 w-12 text-white/40" />
        <div className="space-y-2">
          <p className="font-bold text-lg">Select Account to Redeem</p>
          <p className="text-muted-foreground text-sm">
            Choose an account from your wallet that holds {seasonName} reward
            tokens to redeem them for XRD.
          </p>
        </div>
      </div>
      <div className="w-full max-w-xs">
        <Button
          className="w-full"
          variant="outline"
          onClick={handleSelectAccount}
          disabled={isLoading}
        >
          {isLoading ? 'Open wallet to continue...' : 'Select Account'}
        </Button>
      </div>
    </div>
  );
};

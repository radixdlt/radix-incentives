import { Cause, Exit } from 'effect';
import type { AccountProof } from 'shared/schemas/accountProof';
import type { WalletAccount } from 'shared/schemas/walletAccount';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { useGetAccountProof } from '../../hooks/getAccountProof';

export type SelectAccountEvent = {
  proof: AccountProof;
  account: WalletAccount;
};

export function SelectAccountButton({
  onSelectAccount,
}: {
  onSelectAccount: (value: {
    proof: AccountProof;
    account: WalletAccount;
  }) => void;
}) {
  const { getAccountProof, isLoading: isLoadingAccountProof } =
    useGetAccountProof();
  const handleRequestProof = async () => {
    const exit = await getAccountProof();
    if (Exit.isFailure(exit)) {
      console.error(Cause.pretty(exit.cause));
      toast.error('Failed to get account proof');
    } else {
      toast.success('Account proof retrieved');
      onSelectAccount(exit.value);
    }
  };
  return (
    <Button
      className="w-full"
      variant={'outline'}
      onClick={() => handleRequestProof()}
      disabled={isLoadingAccountProof}
    >
      {isLoadingAccountProof ? 'Open wallet to continue...' : 'Select Account'}
    </Button>
  );
}

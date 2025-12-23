import { XIcon } from 'lucide-react';
import type { WalletAccount } from 'shared/schemas/walletAccount';

export function SelectedAccount({
  account,
  onClearAccount,
}: {
  account: WalletAccount;
  onClearAccount: () => void;
}) {
  return (
    <div className="flex w-full items-center gap-4 rounded border p-4">
      <XIcon
        className="size-4 shrink-0 cursor-pointer text-red-500 hover:text-red-600"
        onClick={onClearAccount}
      />
      <div className="overflow-hidden">
        <p className="font-bold">{account.label}</p>
        <p className="overflow-hidden overflow-ellipsis text-muted-foreground text-sm">
          {account.address}
        </p>
      </div>
    </div>
  );
}

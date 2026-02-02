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
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{account.label}</p>
        <p className="truncate text-muted-foreground text-sm">
          {account.address}
        </p>
      </div>
    </div>
  );
}

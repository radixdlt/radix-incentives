import type { Account } from 'db/incentives';
import { UserAvatar } from '~/components/ui/UserAvatar';

const AccountCard = ({ account }: { account: Account }) => (
  <div className="border-t">
    <div className="divide-y">
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar />
            <div>
              <div className="font-medium">{account.address}</div>
              <div className="text-muted-foreground text-sm">
                {account.label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ConnectedAccounts = ({ accounts }: { accounts: Account[] }) => (
  <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
    <div className="p-6">
      <h3 className="font-medium text-lg">Connected Accounts</h3>
      <p className="mt-1 text-muted-foreground text-sm">
        Connected Radix accounts and verify ownership. Once an account is
        linked, it cannot be removed.
      </p>
    </div>
    {accounts.map((account) => (
      <AccountCard key={account.address} account={account} />
    ))}
  </div>
);

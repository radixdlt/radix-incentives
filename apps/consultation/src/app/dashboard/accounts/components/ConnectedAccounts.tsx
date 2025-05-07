import type { Account } from "db/consultation";
import { UserAvatar } from "~/components/ui/UserAvatar";

const AccountCard = ({ account }: { account: Account }) => (
  <div className="border-t">
    <div className="divide-y">
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar />
            <div>
              <div className="font-medium">{account.address}</div>
              <div className="text-sm text-muted-foreground">
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
  <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
    <div className="p-6">
      <h3 className="text-lg font-medium">Connected Accounts</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Manage your connected Radix accounts and verify ownership.
      </p>
    </div>
    {accounts.map((account) => (
      <AccountCard key={account.address} account={account} />
    ))}
  </div>
);

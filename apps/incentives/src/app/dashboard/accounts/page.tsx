'use client';

import { ConnectAccount } from './components/ConnectAccount';
import { api } from '~/trpc/react';
import { useEffect } from 'react';
import { ConnectedAccounts } from './components/ConnectedAccounts';
import { EmptyState } from '~/components/ui/empty-state';
import { AlertTriangle, Wallet, Info } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';
import { usePersona } from '~/lib/hooks/usePersona';
import { ConnectedState } from '../components/ConnectedState';
import { useDappToolkit } from '~/lib/hooks/useRdt';
import { Card, CardContent } from '~/components/ui/card';

function ParticipationInstructions() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-4">
            <h3 className="font-semibold text-white">
              How to Participate in the Radix Rewards Program
            </h3>
            <div className="text-sm text-white/70 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    You will need to connect a Persona. This may be visible on the
                    leaderboard.
                  </li>
                  <li>
                    You will need to connect at least one account. You can connect
                    multiple accounts and any rewards/points/multiplier earned
                    will be shared across all accounts.
                  </li>
                  <li>
                    You must have at least $50 of XRD total across all linked
                    accounts to participate.
                  </li>
                  <li>
                    Please note, linking multiple accounts will not be visible
                    on-chain or in any UX. It is stored off-ledger.
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Step-by-step instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click the "Connect New Account" button below.</li>
                  <li>
                    Open your Radix Wallet on your mobile device. Use the check boxes
                    to select which accounts you want to connect, then click
                    "Continue" in the wallet app.
                  </li>
                  <li>
                    Sign the verification message in the Radix Wallet app to prove
                    ownership of the account(s) you're linking.
                  </li>
                  <li>
                    Connected accounts will show below. You can repeat this process to
                    connect additional accounts.
                  </li>
                </ol>
                <p className="mt-2 text-sm">
                  Note: An account can only be connected to the dApp with 1
                  Persona and once linked cannot be removed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AccountsPage() {
  const persona = usePersona();
  const rdt = useDappToolkit();

  const accounts = api.account.getAccounts.useQuery(undefined, {
    refetchOnMount: true,
    enabled: !!persona,
    retry: false,
  });

  useEffect(() => {
    if (accounts.error?.data?.code === 'UNAUTHORIZED') {
      rdt?.disconnect();
    }
  }, [accounts.error, rdt]);

  useEffect(() => {
    if (persona?.identityAddress) accounts.refetch();
  }, [persona?.identityAddress, accounts.refetch]);

  if (!persona) {
    return (
      <ConnectedState>
        <div className="space-y-4">
          <EmptyState
            title="Not connected"
            description="Connect your Radix wallet to get started."
            icon={Wallet}
            className="max-w-full"
          />
        </div>
      </ConnectedState>
    );
  }

  // Loading State
  if (accounts.isLoading) {
    return (
      <div className="space-y-4">
        <ParticipationInstructions />
        <ConnectAccount
          onConnect={() => {
            accounts.refetch();
          }}
        />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // Error State
  if (accounts.error) {
    return (
      <div className="space-y-4">
        <ParticipationInstructions />
        <ConnectAccount
          onConnect={() => {
            accounts.refetch();
          }}
        />
        <EmptyState
          title="Error Loading Accounts"
          description={
            accounts.error.message ||
            'An unexpected error occurred. Please try again.'
          }
          icon={AlertTriangle}
          className="max-w-full"
        />
      </div>
    );
  }

  // Loading state could also be added here using accounts.isLoading
  return (
    <div className="space-y-4">
      <ParticipationInstructions />
      <ConnectAccount
        onConnect={() => {
          accounts.refetch();
        }}
      />

      {accounts.data && accounts.data.length > 0 ? (
        <ConnectedAccounts accounts={accounts.data} />
      ) : (
        <EmptyState
          title="No Accounts Connected"
          description="Connect accounts to get started."
          icon={Wallet}
          className="max-w-full"
        />
      )}

    </div>
  );
}

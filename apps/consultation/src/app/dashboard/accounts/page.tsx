"use client";

import { ConnectAccount } from "./components/ConnectAccount";
import { api } from "~/trpc/react";
import { ConnectAccountInstructions } from "./components/Instructions";
import { useEffect } from "react";
import { ConnectedAccounts } from "./components/ConnectedAccounts";
import { EmptyState } from "~/components/ui/empty-state";
import { AlertTriangle, Wallet } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { usePersona } from "~/lib/hooks/usePersona";
import { ConnectedState } from "../components/ConnectedState";
import { useDappToolkit } from "~/lib/hooks/useRdt";

export default function AccountsPage() {
  const persona = usePersona();
  const rdt = useDappToolkit();

  const accounts = api.account.getAccounts.useQuery(undefined, {
    refetchOnMount: true,
    enabled: !!persona,
    retry: false,
  });

  useEffect(() => {
    if (accounts.error?.data?.code === "UNAUTHORIZED") {
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
        <ConnectAccountInstructions />
      </div>
    );
  }

  // Error State
  if (accounts.error) {
    return (
      <div className="space-y-4">
        <ConnectAccount
          onConnect={() => {
            accounts.refetch();
          }}
        />
        <EmptyState
          title="Error Loading Accounts"
          description={
            accounts.error.message ||
            "An unexpected error occurred. Please try again."
          }
          icon={AlertTriangle}
          className="max-w-full"
        />
        <ConnectAccountInstructions />
      </div>
    );
  }

  // Loading state could also be added here using accounts.isLoading
  return (
    <div className="space-y-4">
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

      <ConnectAccountInstructions />
    </div>
  );
}

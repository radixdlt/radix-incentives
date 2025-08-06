'use client';

import { OneTimeDataRequestBuilder } from '@radixdlt/radix-dapp-toolkit';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { useDappToolkit } from '~/lib/hooks/useRdt';
import { api } from '~/trpc/react';

export const ConnectAccount = ({ onConnect }: { onConnect: () => void }) => {
  const rdt = useDappToolkit();
  const [isConnecting, setIsConnecting] = useState(false);
  const verifyAccountOwnership =
    api.account.verifyAccountOwnership.useMutation();

  const connectAccount = async () => {
    setIsConnecting(true);
    try {
      const response = await rdt?.walletApi.sendOneTimeRequest(
        OneTimeDataRequestBuilder.accounts().atLeast(1).withProof(),
      );

      if (!response) throw new Error('Failed to get accounts');
      if (response?.isErr()) throw new Error('Failed to get accounts');

      if (response.isOk()) {
        const value = response.value;
        const accounts = value.accounts;
        const challenge = value.proofs[0]?.challenge!;
        const proofs = value.proofs;

        const result = await verifyAccountOwnership.mutateAsync(
          {
            challenge,
            items: proofs.map((proof) => ({
              address: proof.address,
              label: accounts.find(
                (account) => account.address === proof.address,
              )?.label!,
              type: 'account',
              proof: proof.proof,
            })),
          },
          {
            onError: (error) => {
              toast.error(error.message);
            },
          },
        );

        onConnect();
      }
    } catch (error) {
      console.error('Failed to connect account:', error);

      // TODO: Show error message to the user with toast or something
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold tracking-tight">Account Management</h2>
      <Button
        onClick={connectAccount}
        disabled={isConnecting}
        variant="gradient"
      >
        {isConnecting ? (
          <div className="inline-flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </div>
        ) : (
          'Connect New Account'
        )}
      </Button>
    </div>
  );
};

'use client';

import { OneTimeDataRequestBuilder } from '@radixdlt/radix-dapp-toolkit';
import { UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '~/components/ui/empty-state';
import { useIsAuthenticated } from '~/lib/hooks/useIsAuthenticated';
import { useDappToolkit } from '~/lib/hooks/useRdt';
import { api, type RouterInputs } from '~/trpc/react';
import { AccountRecoveryButton } from './components/AccountRecoveryButton';
import { AccountRecoveryInstructions } from './components/AccountRecoveryInstructions';
import { AccountRecoveryProofList } from './components/AccountRecoveryProofList';
import { AccountRecoverySuccess } from './components/AccountRecoverySuccess';
import { NotAllowed } from './components/NotAllowed';

export default function AccountRecoveryPage() {
  const router = useRouter();
  const [isRecovering, setIsRecovering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const rdt = useDappToolkit();
  const utils = api.useUtils();
  const isAuthenticated = useIsAuthenticated();
  const startAccountRecovery =
    api.auth.accountRecovery.startRecovery.useMutation({
      onSuccess: () => {
        void utils.auth.accountRecovery.pending.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  const {
    data: pendingAccountRecovery,
    isLoading: isLoadingPendingAccountRecovery,
  } = api.auth.accountRecovery.pending.useQuery(undefined, {
    enabled: !!isAuthenticated,
  });
  const { data: accountRecoveryProofs, isLoading: isLoadingProofs } =
    api.auth.accountRecovery.listProofs.useQuery(
      {
        recoveryRequestId: pendingAccountRecovery?.id ?? '',
      },
      {
        enabled: !!isAuthenticated && !!pendingAccountRecovery?.id,
      },
    );
  const { data: connectedAccounts, isLoading: connectedAccountsLoading } =
    api.account.getAccounts.useQuery(undefined, {
      enabled: !!isAuthenticated,
    });
  const submitAccountProof = api.auth.accountRecovery.submitProof.useMutation({
    onSuccess: () => {
      void utils.auth.accountRecovery.listProofs.invalidate();
      toast.success('Account proof submitted');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const completeAccountRecovery =
    api.auth.accountRecovery.completeRecovery.useMutation({
      onSuccess: () => {
        toast.success('Account recovery completed');
        setIsSuccess(true);
        void rdt?.disconnect();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const hasConnectedAccounts =
    connectedAccounts && connectedAccounts?.length > 0;

  const recoveryRequestId = pendingAccountRecovery?.id ?? '';

  const isLoading = connectedAccountsLoading || isLoadingProofs;

  const handleRecoverAccount = useCallback(async () => {
    setIsRecovering(true);
    const result = await rdt?.walletApi
      .sendOneTimeRequest(
        OneTimeDataRequestBuilder.accounts().exactly(1).withProof(),
      )
      .mapErr(() => {
        toast.error('Failed to get account ownership proof');
        setIsRecovering(false);
      })
      .map((walletResponse) =>
        walletResponse.proofs[0]
          ? { ...walletResponse.proofs[0], label: '' }
          : undefined,
      );

    if (!result || result.isErr()) {
      return;
    }

    const rolaProof = result.value;

    if (!rolaProof) {
      toast.error('Missing proof of ownership in wallet response');
      setIsRecovering(false);
      return;
    }

    startAccountRecovery.mutateAsync(
      {
        rolaProof,
      },
      {
        onSuccess: () => {
          setIsRecovering(false);
        },
        onError: (error) => {
          toast.error(error.message);
          setIsRecovering(false);
        },
      },
    );
  }, [rdt]);

  const handleRequestProof = useCallback(
    async (address: string) => {
      // await handleRecoverAccount(address);
      const result = await rdt?.walletApi
        .sendOneTimeRequest(
          OneTimeDataRequestBuilder.proofOfOwnership().accounts([address]),
        )
        .map((walletResponse) => walletResponse.proofs[0]);

      if (!result || result?.isErr()) {
        toast.error(result?.error.message ?? 'Failed to request proof');
        return;
      }

      if (result.isOk()) {
        const rolaProof = {
          ...result.value,
          label: '',
        } as RouterInputs['auth']['accountRecovery']['submitProof']['rolaProof'];

        await submitAccountProof.mutateAsync({
          rolaProof,
          recoveryRequestId,
        });
      }
    },
    [rdt, recoveryRequestId],
  );

  const handleCompleteAccountRecovery = async () => {
    await completeAccountRecovery.mutateAsync({
      recoveryRequestId,
    });
  };

  if (isSuccess)
    return <AccountRecoverySuccess onClick={() => router.push('/dashboard')} />;

  if (!isAuthenticated)
    return (
      <EmptyState
        title={`Account recovery`}
        description="Connect your persona to get started."
        icon={UserIcon}
        className="max-w-full"
      />
    );

  if (hasConnectedAccounts) return <NotAllowed />;

  return (
    <div>
      <AccountRecoveryInstructions />

      {!pendingAccountRecovery && !isLoadingPendingAccountRecovery && (
        <AccountRecoveryButton
          disabled={isRecovering}
          onClick={handleRecoverAccount}
        >
          {isRecovering ? 'Open your wallet...' : 'Start Account Recovery'}
        </AccountRecoveryButton>
      )}

      {pendingAccountRecovery && (
        <AccountRecoveryProofList
          items={accountRecoveryProofs ?? []}
          loading={isLoading}
          onRequestProof={handleRequestProof}
          onFinalizeRecovery={handleCompleteAccountRecovery}
        />
      )}
    </div>
  );
}

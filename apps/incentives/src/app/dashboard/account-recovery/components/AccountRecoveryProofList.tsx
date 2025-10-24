import { Shield, ShieldCheckIcon } from 'lucide-react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader } from '~/components/ui/card';
import { Spinner } from '~/components/ui/spinner';
import type { RouterOutputs } from '~/trpc/react';
import { AccountRecoveryButton } from './AccountRecoveryButton';
import { SkeletonLoader } from './SkeletonLoader';

type AccountProof =
  RouterOutputs['auth']['accountRecovery']['listProofs'][number];

const iconStyle = 'self-center shrink-0 m-0';

function AccountRecoveryProofItem({
  item,
  onRequestProof,
}: {
  item: AccountProof;
  onRequestProof: () => Promise<void>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const handleProofRequest = async () => {
    try {
      setLoading(true);
      await onRequestProof();
      setLoading(false);
    } catch (_) {
      setLoading(false);
    }
  };
  return (
    <Card key={item.accountAddress} className="mb-3">
      <CardHeader className="grid md:grid-cols-4">
        <div className="m-0 flex gap-1.5 overflow-hidden md:col-span-3">
          {item.verified ? (
            <ShieldCheckIcon className={twMerge(iconStyle, 'text-green-500')} />
          ) : (
            <Shield className={iconStyle} />
          )}
          <p className="self-center overflow-hidden overflow-ellipsis">
            {item.accountAddress}
          </p>
        </div>
        {!item.verified && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 md:col-span-1 md:mt-0"
            disabled={loading}
            onClick={handleProofRequest}
          >
            {loading ? (
              <>
                <Spinner className="mr-1" />
                Waiting for proof...
              </>
            ) : (
              'Provide Proof'
            )}
          </Button>
        )}
      </CardHeader>
    </Card>
  );
}

export function AccountRecoveryProofList({
  items,
  onRequestProof,
  loading,
  onFinalizeRecovery,
}: {
  items: AccountProof[];
  loading: boolean;
  onRequestProof: (address: string) => Promise<void>;
  onFinalizeRecovery: () => Promise<void>;
}) {
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);

  const collectedProofs = items.reduce((acc, item) => {
    acc += item.verified ? 1 : 0;
    return acc;
  }, 0);

  if (loading) {
    return <SkeletonLoader />;
  }

  const isAllProofsCollected = collectedProofs === items.length;

  const handleFinalizeRecovery = async () => {
    setIsFinalizing(true);
    await onFinalizeRecovery();
    setIsFinalizing(false);
  };

  return (
    <div>
      <h2 className="mt-4 mb-4 font-bold text-xl">
        Collected Account Proofs ({collectedProofs}/{items.length})
      </h2>
      {items.map((item) => (
        <AccountRecoveryProofItem
          key={item.accountAddress}
          item={item}
          onRequestProof={async () => onRequestProof(item.accountAddress)}
        />
      ))}
      <AccountRecoveryButton
        disabled={!isAllProofsCollected}
        onClick={handleFinalizeRecovery}
      >
        {isFinalizing ? 'Finalizing recovery...' : 'Finalize Account Recovery'}
      </AccountRecoveryButton>
    </div>
  );
}

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useDappToolkit } from './useRdt';

type SubmitTransactionParams = {
  manifest: string;
  message?: string;
  onSuccess?: (transactionIntentHash: string) => void;
  onError?: (error: unknown) => void;
};

type SubmitTransactionResult = {
  success: boolean;
  transactionIntentHash?: string;
  error?: string;
};

/**
 * Hook for submitting transactions to the Radix network via the wallet
 */
export const useSubmitTransaction = () => {
  const rdt = useDappToolkit();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTransaction = useCallback(
    async ({
      manifest,
      message,
      onSuccess,
      onError,
    }: SubmitTransactionParams): Promise<SubmitTransactionResult> => {
      if (!rdt) {
        toast.error('Wallet not connected');
        return { success: false, error: 'Wallet not connected' };
      }

      setIsSubmitting(true);

      try {
        const result = await rdt.walletApi.sendTransaction({
          transactionManifest: manifest,
          message,
        });

        if (result.isErr()) {
          const errorMessage = result.error.message ?? 'Transaction failed';
          toast.error(errorMessage);
          onError?.(result.error);
          return { success: false, error: errorMessage };
        }

        const { transactionIntentHash } = result.value;
        toast.success('Transaction successful!', {
          description: `Transaction: ${transactionIntentHash.slice(0, 16)}...`,
        });
        onSuccess?.(transactionIntentHash);

        return { success: true, transactionIntentHash };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Transaction failed';
        toast.error(errorMessage);
        onError?.(error);
        return { success: false, error: errorMessage };
      } finally {
        setIsSubmitting(false);
      }
    },
    [rdt],
  );

  return { submitTransaction, isSubmitting };
};

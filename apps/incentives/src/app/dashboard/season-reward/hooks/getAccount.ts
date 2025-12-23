import {
  OneTimeDataRequestBuilder,
  type WalletDataRequestError,
} from '@radixdlt/radix-dapp-toolkit';
import { Array as A, Data, Effect, Option, pipe, Schema } from 'effect';
import { useCallback, useState } from 'react';
import { WalletAccountSchema } from 'shared/schemas/walletAccount';
import { useDappToolkit } from '~/lib/hooks/useRdt';

class UnExpectedDappToolkitError extends Data.TaggedError(
  'UnExpectedDappToolkitError',
)<{
  error: unknown;
}> {}

class WalletResponseError extends Data.TaggedError('WalletResponseError')<{
  error: WalletDataRequestError;
}> {}

/**
 * Hook to select an account from wallet without requesting a proof.
 * Use this when you only need to know which account to use for a transaction,
 * but don't need to verify account ownership server-side.
 */
export const useGetAccount = () => {
  const rdt = useDappToolkit();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getAccount = useCallback(async () => {
    return Effect.gen(function* () {
      if (!rdt)
        return yield* new UnExpectedDappToolkitError({
          error: 'RDT not found',
        });
      setIsLoading(true);
      const result = yield* Effect.tryPromise({
        try: () =>
          rdt.walletApi.sendOneTimeRequest(
            OneTimeDataRequestBuilder.accounts().exactly(1),
          ),
        catch: (error) => new UnExpectedDappToolkitError({ error }),
      });

      if (result.isErr()) {
        setIsLoading(false);
        return yield* new WalletResponseError({ error: result.error });
      }

      const account = pipe(result.value.accounts, A.head, Option.getOrNull);

      setIsLoading(false);

      return yield* Schema.decodeUnknown(
        Schema.Struct({
          account: WalletAccountSchema,
        }),
      )({ account });
    }).pipe(Effect.runPromiseExit);
  }, [rdt]);

  return { getAccount, isLoading };
};

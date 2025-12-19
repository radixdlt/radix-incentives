import {
  OneTimeDataRequestBuilder,
  type WalletDataRequestError,
} from '@radixdlt/radix-dapp-toolkit';
import { Array as A, Data, Effect, Option, pipe, Schema } from 'effect';
import { useCallback, useState } from 'react';
import { AccountProofSchema } from 'shared/schemas/accountProof';
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

export const useGetAccountProof = () => {
  const rdt = useDappToolkit();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getAccountProof = useCallback(async () => {
    return Effect.gen(function* () {
      if (!rdt)
        return yield* new UnExpectedDappToolkitError({
          error: 'RDT not found',
        });
      setIsLoading(true);
      const result = yield* Effect.tryPromise({
        try: () =>
          rdt.walletApi.sendOneTimeRequest(
            OneTimeDataRequestBuilder.accounts().exactly(1).withProof(),
          ),
        catch: (error) => new UnExpectedDappToolkitError({ error }),
      });

      if (result.isErr()) {
        setIsLoading(false);
        return yield* new WalletResponseError({ error: result.error });
      }

      const proof = pipe(result.value.proofs, A.head, Option.getOrNull);
      const account = pipe(result.value.accounts, A.head, Option.getOrNull);

      setIsLoading(false);

      return yield* Schema.decodeUnknown(
        Schema.Struct({
          proof: AccountProofSchema,
          account: WalletAccountSchema,
        }),
      )({ proof, account });
    }).pipe(Effect.runPromiseExit);
  }, [rdt]);

  return { getAccountProof, isLoading };
};

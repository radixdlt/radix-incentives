import { RadixEngineToolkit } from '@radixdlt/radix-engine-toolkit';
import { Effect } from 'effect';
import { TransactionManifestString } from 'shared/brandedTypes';
import type { AccountAddress } from '../../account-balance/v2/schemas';

export const faucet = (accountAddress: AccountAddress) =>
  Effect.gen(function* () {
    const knownAddresses = yield* Effect.tryPromise(() =>
      RadixEngineToolkit.Utils.knownAddresses(2),
    );

    return TransactionManifestString.make(`
      CALL_METHOD
        Address("${knownAddresses.componentAddresses.faucet}")
        "lock_fee"
        Decimal("10")
      ;
    
      CALL_METHOD
        Address("${knownAddresses.componentAddresses.faucet}")
        "free"
      ;
    
      CALL_METHOD
        Address("${accountAddress}")
        "try_deposit_batch_or_abort"
        Expression("ENTIRE_WORKTOP")
        Enum<0u8>()
      ;`);
  });

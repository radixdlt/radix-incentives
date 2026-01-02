import { Effect } from 'effect';
import { TransactionManifestString } from 'shared/brandedTypes';
import type { Account } from 'shared/schemas/account';
import type { Amount } from '../../account-balance/v2/schemas';

export class ManifestHelper extends Effect.Service<ManifestHelper>()(
  'ManifestHelper',
  {
    effect: Effect.gen(function* () {
      return {
        addFeePayer: (input: { account: Account; amount: Amount }) =>
          Effect.gen(function* () {
            if (input.account.type === 'unsecurifiedAccount') {
              return TransactionManifestString.make(`
                CALL_METHOD
                  Address("${input.account.address}")
                  "lock_fee"
                  Decimal("${input.amount}")
                ;
              `);
            }

            return TransactionManifestString.make(`
              CALL_METHOD
                Address("${input.account.accessControllerAddress}")
                "create_proof"
              ;

              CALL_METHOD
                Address("${input.account.address}")
                "lock_fee"
                Decimal("${input.amount}")
              ;
            `);
          }),
      };
    }),
  },
) {}

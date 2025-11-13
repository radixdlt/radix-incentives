import { Effect, HashMap } from 'effect';
import { reduce } from 'effect/Array';
import { GetFungibleBalanceService } from '../../../../common/gateway';
import {
  AccountAddress,
  Amount,
  FungibleResourceAddress,
  type StateVersion,
} from '../schemas';

export class AccountBalanceHelper extends Effect.Service<AccountBalanceHelper>()(
  'AccountBalanceHelper',
  {
    dependencies: [GetFungibleBalanceService.Default],
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      return {
        getFungibleTokens: (input: {
          addresses: AccountAddress[];
          stateVersion: StateVersion;
        }) =>
          getFungibleBalanceService({
            addresses: input.addresses,
            at_ledger_state: {
              state_version: input.stateVersion,
            },
          }).pipe(
            Effect.map(
              reduce(
                HashMap.empty<
                  AccountAddress,
                  HashMap.HashMap<FungibleResourceAddress, Amount>
                >(),
                (acc, item) => {
                  const resources = reduce(
                    item.fungibleResources,
                    HashMap.empty<FungibleResourceAddress, Amount>(),
                    (acc, item) =>
                      HashMap.set(
                        acc,
                        FungibleResourceAddress(item.resourceAddress),
                        Amount(item.amount.toString()),
                      ),
                  );

                  return HashMap.set(
                    acc,
                    AccountAddress(item.address),
                    resources,
                  );
                },
              ),
            ),
          ),
      };
    }),
  },
) {}

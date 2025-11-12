import { Array as A, Effect, Option, Record as R, Ref, Schema } from 'effect';
import {
  GetFungibleBalanceService,
  GetLedgerStateService,
} from '../../../common/gateway';
import {
  AccountBalanceState,
  FungibleTokenBalanceState,
  NonFungibleTokenBalanceState,
} from './accountBalanceState';
import { HoldingPosition } from './positions/holding';
import { StakedPosition } from './positions/staked';
import { WeftFinancePosition } from './positions/weft/weft';
import {
  AccountAddress,
  type AmountUsd,
  NonFungibleResourceAddress,
} from './schemas';

const GetAccountBalancesAtStateVersionV2InputSchema = Schema.Struct({
  addresses: Schema.mutable(Schema.Array(Schema.String)),
  stateVersion: Schema.Number,
});

type GetAccountBalancesAtStateVersionV2Input =
  typeof GetAccountBalancesAtStateVersionV2InputSchema.Type;

export class GetAccountBalancesAtStateVersionV2 extends Effect.Service<GetAccountBalancesAtStateVersionV2>()(
  'GetAccountBalancesAtStateVersionV2',
  {
    dependencies: [
      GetFungibleBalanceService.Default,
      AccountBalanceState.Default,
      GetLedgerStateService.Default,
      HoldingPosition.Default,
      StakedPosition.Default,
      WeftFinancePosition.Default,
    ],
    effect: Effect.gen(function* () {
      const accountBalanceState = yield* AccountBalanceState;
      const getLedgerStateService = yield* GetLedgerStateService;
      const holdingPosition = yield* HoldingPosition;
      const stakedPosition = yield* StakedPosition;
      const weftPosition = yield* WeftFinancePosition;

      return Effect.fnUntraced(function* (
        input: GetAccountBalancesAtStateVersionV2Input,
      ) {
        const ledgerState = yield* getLedgerStateService({
          at_ledger_state: {
            state_version: input.stateVersion,
          },
        });
        const validatorStateRef =
          yield* accountBalanceState.makeValidatorsState;

        const claimNftResourceAddresses = yield* Ref.get(
          validatorStateRef,
        ).pipe(
          Effect.map(A.map((validator) => validator.claimNftResourceAddress)),
        );

        const nftResourceAddresses = [
          ...claimNftResourceAddresses,
          WeftFinancePosition.nftResourceAddress,
        ].map(NonFungibleResourceAddress);

        const nonFungibleTokenBalanceState =
          yield* accountBalanceState.makeNonFungibleTokenBalanceState({
            addresses: input.addresses,
            stateVersion: input.stateVersion,
            resourceAddresses: nftResourceAddresses,
          });

        const timestamp = new Date(ledgerState.proposer_round_timestamp);

        const addresses = input.addresses.map(AccountAddress);
        const stateVersion = input.stateVersion;

        yield* Effect.log(
          `getting account balances at state version '${input.stateVersion}' (${timestamp.toISOString()}) for ${input.addresses.length} addresses`,
        );

        const positions = yield* Effect.gen(function* () {
          const positions = yield* Effect.all([
            holdingPosition.fromState({
              addresses,
              stateVersion,
              timestamp,
            }),
            // returns LSU and unstaked
            stakedPosition.fromState({
              addresses,
              stateVersion,
              timestamp,
            }),
            weftPosition.fromState({
              addresses,
              stateVersion,
              timestamp,
            }),
          ]);

          return positions.reduce(
            (acc, position) =>
              R.union(acc, position, (a, b) => ({ ...a, ...b })),
            R.empty<AccountAddress, Record<string, AmountUsd>>(),
          );
        }).pipe(
          Effect.provideService(
            FungibleTokenBalanceState,
            yield* accountBalanceState.makeFungibleTokenBalanceState(input),
          ),
          Effect.provideService(
            NonFungibleTokenBalanceState,
            nonFungibleTokenBalanceState,
          ),
        );

        const accountBalances = input.addresses.reduce((acc, address) => {
          const position = R.get(positions, AccountAddress(address)).pipe(
            Option.match({
              onNone: () => R.empty<string, AmountUsd>(),
              onSome: (position) => position,
            }),
          );
          return R.set(acc, AccountAddress(address), position);
        }, R.empty<AccountAddress, Record<string, AmountUsd>>());

        return accountBalances;
      });
    }),
  },
) {}

import {
  Array as A,
  Config,
  Effect,
  flow,
  Record as R,
  Ref,
  Schema,
} from 'effect';
import {
  GetFungibleBalanceService,
  GetLedgerStateService,
} from '../../../common/gateway';
import {
  AccountBalanceState,
  FungibleTokenBalanceState,
  NonFungibleTokenBalanceState,
} from './accountBalanceState';
import { CaviarNinePosition } from './positions/caviarnine/caviarnine';
import { HoldingPosition } from './positions/holding';
import { StakedPosition } from './positions/staked';
import { WeftFinancePosition } from './positions/weft/weft';
import { AccountAddress, type AmountUsd, StateVersion } from './schemas';

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
      CaviarNinePosition.Default,
    ],
    effect: Effect.gen(function* () {
      const accountBalanceState = yield* AccountBalanceState;
      const getLedgerStateService = yield* GetLedgerStateService;
      const holdingPosition = yield* HoldingPosition;
      const stakedPosition = yield* StakedPosition;
      const weftPosition = yield* WeftFinancePosition;
      const caviarNinePosition = yield* CaviarNinePosition;

      const concurrency = yield* Config.number(
        'GET_ACCOUNT_BALANCES_CONCURRENCY',
      ).pipe(Config.withDefault(10));

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

        const timestamp = new Date(ledgerState.proposer_round_timestamp);
        const addresses = input.addresses.map(AccountAddress);
        const stateVersion = StateVersion(input.stateVersion);

        yield* Effect.log(
          `getting account balances at state version '${input.stateVersion}' (${timestamp.toISOString()}) for ${input.addresses.length} addresses`,
        );

        const allPositions = [
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
          caviarNinePosition.fromState({
            addresses,
            stateVersion,
            timestamp,
          }),
        ];

        return yield* Effect.all(allPositions, {
          concurrency,
        }).pipe(
          Effect.map(
            flow(
              A.reduce(
                R.empty<AccountAddress, Record<string, AmountUsd>>(),
                (acc, position) =>
                  R.union(acc, position, (a, b) => ({ ...a, ...b })),
              ),
            ),
          ),
          Effect.provideService(
            FungibleTokenBalanceState,
            yield* accountBalanceState.makeFungibleTokenBalanceState(input),
          ),
          Effect.provideService(
            NonFungibleTokenBalanceState,
            yield* accountBalanceState.makeNonFungibleTokenBalanceState({
              addresses,
              stateVersion,
              resourceAddresses: [
                ...claimNftResourceAddresses,
                ...CaviarNinePosition.nftResourceAddresses,
                WeftFinancePosition.nftResourceAddress,
              ],
            }),
          ),
        );
      });
    }),
  },
) {}

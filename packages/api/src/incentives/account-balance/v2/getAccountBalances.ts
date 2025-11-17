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
import { DefiPlazaPosition } from './positions/defiplaza/defiplaza';
import { FluxPosition } from './positions/flux/flux';
import { HoldingPosition } from './positions/holding';
import { OciswapPosition } from './positions/ociswap/ociswap';
import { RootFinancePosition } from './positions/root/root';
import { StakedPosition } from './positions/staked';
import { SurgePosition } from './positions/surge/surge';
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
      SurgePosition.Default,
      OciswapPosition.Default,
      DefiPlazaPosition.Default,
      FluxPosition.Default,
      RootFinancePosition.Default,
    ],
    effect: Effect.gen(function* () {
      const accountBalanceState = yield* AccountBalanceState;
      const getLedgerStateService = yield* GetLedgerStateService;
      const holdingPosition = yield* HoldingPosition;
      const stakedPosition = yield* StakedPosition;
      const caviarNinePosition = yield* CaviarNinePosition;
      const surgePosition = yield* SurgePosition;
      const ociswapPosition = yield* OciswapPosition;
      const defiPlazaPosition = yield* DefiPlazaPosition;
      const fluxPosition = yield* FluxPosition;
      const weftPosition = yield* WeftFinancePosition;
      const rootFinancePosition = yield* RootFinancePosition;

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

        const validatorClaimNftResourceAddresses = yield* Ref.get(
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
          surgePosition.fromState({
            addresses,
            stateVersion,
            timestamp,
          }),
          ociswapPosition.fromState({
            addresses,
            stateVersion,
            timestamp,
          }),
          defiPlazaPosition.fromState({
            addresses,
            stateVersion,
            timestamp,
          }),
          fluxPosition.fromState({
            addresses,
            stateVersion,
            timestamp,
          }),
          rootFinancePosition.fromState({
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
                ...validatorClaimNftResourceAddresses,
                ...CaviarNinePosition.nftResourceAddresses,
                ...OciswapPosition.nftResourceAddresses,
                WeftFinancePosition.nftResourceAddress,
                RootFinancePosition.nftResourceAddress,
                FluxPosition.nftResourceAddress,
              ],
            }),
          ),
        );
      });
    }),
  },
) {}

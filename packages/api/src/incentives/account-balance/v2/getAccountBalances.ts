import { Effect, Schema } from 'effect';
import {
  GetFungibleBalanceService,
  GetLedgerStateService,
} from '../../../common/gateway';
import {
  AccountBalanceState,
  FungibleTokenBalanceState,
} from './accountBalanceState';
import { LsuLpPosition } from './positions/lsuLp';
import { AccountAddress } from './schemas';

export type AccountBalance = {
  address: string;
  // staked: Lsu[];
  // unstaked: Unstaked[];
  // lsulp: Lsulp;
  // fungibleTokenBalances: FungibleTokenBalance[];
  // nonFungibleTokenBalances: NonFungibleTokenBalance[];
  // weftFinancePositions: WeftFinancePosition;
  // rootFinancePositions: RootFinancePosition[];
  // fluxCdpPositions: FluxCdpPosition;
  // fluxReservoirPositions: FluxReservoirPosition;
  // caviarninePositions: CaviarNinePosition;
  // ociswapPositions: OciswapPosition;
  // defiPlazaPositions: DefiPlazaPosition;
  // hyperstakePositions: HyperstakePosition;
  // surgePositions: SurgePosition;
  // surgeMarginAccountBalances: SurgeMarginAccountBalance[];
  // convertLsuToXrdMap: Map<string, (amount: BigNumber) => BigNumber>;
};

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
      LsuLpPosition.Default,
      GetLedgerStateService.Default,
    ],
    effect: Effect.gen(function* () {
      const accountBalanceState = yield* AccountBalanceState;
      const lsuLpPosition = yield* LsuLpPosition;
      const getLedgerStateService = yield* GetLedgerStateService;

      return Effect.fnUntraced(function* (
        input: GetAccountBalancesAtStateVersionV2Input,
      ) {
        const ledgerState = yield* getLedgerStateService({
          at_ledger_state: {
            state_version: input.stateVersion,
          },
        });

        const timestamp = new Date(ledgerState.proposer_round_timestamp);

        const addresses = input.addresses.map(AccountAddress);
        const stateVersion = input.stateVersion;

        yield* Effect.log(
          `getting account balances at state version '${input.stateVersion}' (${timestamp.toISOString()}) for ${input.addresses.length} addresses`,
        );

        const positions = yield* Effect.gen(function* () {
          const positions = yield* Effect.all([
            lsuLpPosition.fromState({
              addresses,
              stateVersion,
              timestamp,
            }),
          ]);

          return positions;
        }).pipe(
          Effect.provideService(
            FungibleTokenBalanceState,
            yield* accountBalanceState.makeFungibleTokenBalanceState(input),
          ),
        );

        yield* Effect.log(positions);
      });
    }),
  },
) {}

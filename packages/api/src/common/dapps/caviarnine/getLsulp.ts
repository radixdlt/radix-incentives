import { Effect } from "effect";
import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from "../../gateway/getFungibleBalance";
import { DappConstants } from "data";
import { BigNumber } from "bignumber.js";
import type { AtLedgerState } from "../../gateway/schemas";

const CaviarNineConstants = DappConstants.CaviarNine.constants;

export class GetLsulpService extends Effect.Service<GetLsulpService>()(
  "GetLsulpService",
  {
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      return Effect.fn(function* (input: {
        at_ledger_state: AtLedgerState;
        addresses: string[];
        fungibleBalance?: GetFungibleBalanceOutput;
      }) {
        const fungibleBalanceResults = input.fungibleBalance
          ? input.fungibleBalance
          : yield* getFungibleBalanceService(input).pipe(
              Effect.withSpan("getFungibleBalanceService")
            );

        return fungibleBalanceResults.map((item) => {
          const lsulpAmount = item.fungibleResources.find(
            (resource) =>
              resource.resourceAddress ===
              CaviarNineConstants.LSULP.resourceAddress
          ) ?? {
            amount: new BigNumber(0),
          };
          return {
            address: item.address,
            lsulp: {
              resourceAddress: CaviarNineConstants.LSULP.resourceAddress,
              amount: lsulpAmount.amount,
            },
          };
        });
      });
    }),
  }
) {}

export const GetLsulpLive = GetLsulpService.Default;

import { Effect } from "effect";
import {
  type GetFungibleBalanceOutput,
  GetFungibleBalanceService,
} from "../gateway/getFungibleBalance";
import {
  type GetNonFungibleBalanceOutput,
  GetNonFungibleBalanceService,
} from "../gateway/getNonFungibleBalance";
import {
  GetAllValidatorsService,
  type Validator,
} from "../gateway/getAllValidators";
import { claimNftSchema } from "./schema";
import { BigNumber } from "bignumber.js";

import type { AtLedgerState } from "../gateway/schemas";

export class GetUserStakingPositionsService extends Effect.Service<GetUserStakingPositionsService>()(
  "GetUserStakingPositionsService",
  {
    effect: Effect.gen(function* () {
      const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;
      const getAllValidatorsService = yield* GetAllValidatorsService;
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      return Effect.fn(function* (input: {
        addresses: string[];
        at_ledger_state: AtLedgerState;
        nonFungibleBalance?: GetNonFungibleBalanceOutput;
        fungibleBalance?: GetFungibleBalanceOutput;
        validators?: Validator[];
      }) {
        const validators =
          input.validators ?? (yield* getAllValidatorsService());

        const claimNftResourceAddressSet = new Set(
          validators.map((validator) => validator.claimNftResourceAddress)
        );

        const lsuResourceAddressSet = new Set(
          validators.map((validator) => validator.lsuResourceAddress)
        );

        const nonFungibleBalanceResults = input.nonFungibleBalance
          ? input.nonFungibleBalance
          : yield* getNonFungibleBalanceService({
              addresses: input.addresses,
              at_ledger_state: input.at_ledger_state,
            }).pipe(Effect.withSpan("getNonFungibleBalanceService"));

        const fungibleBalanceResults = input.fungibleBalance
          ? input.fungibleBalance
          : yield* getFungibleBalanceService({
              addresses: input.addresses,
              at_ledger_state: input.at_ledger_state,
            }).pipe(Effect.withSpan("getFungibleBalanceService"));

        const staked = fungibleBalanceResults.map((item) => {
          const lsus = item.fungibleResources.filter((resource) =>
            lsuResourceAddressSet.has(resource.resourceAddress)
          );

          return {
            address: item.address,
            staked: lsus,
          };
        });

        const unstaked = nonFungibleBalanceResults.items.map((item) => {
          const claimNfts = item.nonFungibleResources
            .filter((nonFungibleResource) =>
              claimNftResourceAddressSet.has(
                nonFungibleResource.resourceAddress
              )
            )
            .flatMap((nonFungibleResource) => {
              const resourceAddress = nonFungibleResource.resourceAddress;
              return nonFungibleResource.items
                .map((item) => {
                  const claimNft = claimNftSchema.safeParse(item.sbor!);

                  if (claimNft.isErr()) {
                    return null;
                  }

                  const { claim_epoch, claim_amount } = claimNft.value;

                  return {
                    resourceAddress,
                    id: item.id,
                    claimEpoch: claim_epoch,
                    amount: new BigNumber(claim_amount),
                  };
                })
                .filter((item) => item !== null);
            });
          return {
            address: item.address,
            unstaked: claimNfts,
          };
        });

        const results = input.addresses.map((address) => {
          const stakedItems =
            staked.find((item) => item.address === address)?.staked ?? [];

          const unstakedItems =
            unstaked.find((item) => item.address === address)?.unstaked ?? [];

          return {
            address,
            staked: stakedItems,
            unstaked: unstakedItems,
          };
        });

        return {
          items: results,
        };
      });
    }),
  }
) {}

export const GetUserStakingPositionsLive =
  GetUserStakingPositionsService.Default;

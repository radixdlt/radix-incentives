import { Effect } from "effect";
import {
  GetFungibleBalanceService,
  type StateEntityDetailsInput,
} from "../gateway/getFungibleBalance";
import { GetNonFungibleBalanceService } from "../gateway/getNonFungibleBalance";
import { GetAllValidatorsService } from "../gateway/getAllValidators";
import { claimNftSchema } from "./schema";
import { BigNumber } from "bignumber.js";

export const getUserStakingPositions = (input: {
  addresses: string[];
  state?: StateEntityDetailsInput["state"];
}) =>
  Effect.gen(function* () {
    yield* Effect.logTrace(input);
    const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;
    const getAllValidatorsService = yield* GetAllValidatorsService;
    const getFungibleBalanceService = yield* GetFungibleBalanceService;

    const validators = yield* getAllValidatorsService();

    const claimNftResourceAddressSet = new Set(
      validators.map((validator) => validator.claimNftResourceAddress)
    );

    const lsuResourceAddressSet = new Set(
      validators.map((validator) => validator.lsuResourceAddress)
    );

    // batch addresses into chunks of 20
    const chunks = input.addresses.reduce((acc, address, index) => {
      const chunkIndex = Math.floor(index / 20);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(address);
      return acc;
    }, [] as string[][]);

    const nonFungibleBalanceResults = yield* Effect.all(
      chunks.map((chunk) =>
        getNonFungibleBalanceService({
          addresses: chunk,
          state: input.state,
        }).pipe(Effect.withSpan("getNonFungibleBalanceService"))
      ),
      {
        concurrency: "unbounded",
      }
    ).pipe(
      Effect.map((results) => {
        const items = results.flatMap((result) => result.items);
        return {
          stateVersion: results[0].stateVersion,
          items,
        };
      })
    );

    const fungibleBalanceResults = yield* getFungibleBalanceService({
      addresses: input.addresses,
      state: input.state,
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
          claimNftResourceAddressSet.has(nonFungibleResource.resourceAddress)
        )
        .flatMap((nonFungibleResource) => {
          const resourceAddress = nonFungibleResource.resourceAddress;
          return nonFungibleResource.items
            .map((item) => {
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
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
      stateVersion: nonFungibleBalanceResults.stateVersion,
      items: results,
    };
  }).pipe(Effect.withSpan("getUserStakingPositions"));

import { Context, Effect, Layer } from "effect";
import {
  GetFungibleBalanceService,
  type InvalidInputError,
} from "../gateway/getFungibleBalance";
import { GetNonFungibleBalanceService } from "../gateway/getNonFungibleBalance";
import {
  type GetAllValidatorsError,
  GetAllValidatorsService,
} from "../gateway/getAllValidators";
import { claimNftSchema } from "./schema";
import { BigNumber } from "bignumber.js";
import type { EntityNotFoundError, GatewayError } from "../gateway/errors";
import type { GetLedgerStateService } from "../gateway/getLedgerState";
import type { LoggerService } from "../logger/logger";
import type { EntityFungiblesPageService } from "../gateway/entityFungiblesPage";
import type { EntityNonFungiblesPageService } from "../gateway/entityNonFungiblesPage";
import type { GatewayApiClientService } from "../gateway/gatewayApiClient";
import type { GetEntityDetailsError } from "../gateway/getEntityDetails";
import type { AtLedgerState } from "../gateway/schemas";

export type UserStakingPositionsOutput = {
  items: {
    address: string;
    staked: { resourceAddress: string; amount: BigNumber }[];
    unstaked: {
      resourceAddress: string;
      id: string;
      claimEpoch: number;
      amount: BigNumber;
    }[];
  }[];
};

export class GetUserStakingPositionsService extends Context.Tag(
  "GetUserStakingPositionsService"
)<
  GetUserStakingPositionsService,
  (input: {
    addresses: string[];
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<
    UserStakingPositionsOutput,
    | GetAllValidatorsError
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError,
    | GetNonFungibleBalanceService
    | GetAllValidatorsService
    | GetFungibleBalanceService
    | LoggerService
    | GetLedgerStateService
    | EntityFungiblesPageService
    | EntityNonFungiblesPageService
    | GatewayApiClientService
  >
>() {}

export const GetUserStakingPositionsLive = Layer.effect(
  GetUserStakingPositionsService,
  Effect.gen(function* () {
    const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;
    const getAllValidatorsService = yield* GetAllValidatorsService;
    const getFungibleBalanceService = yield* GetFungibleBalanceService;

    return (input) => {
      return Effect.gen(function* () {
        const validators = yield* getAllValidatorsService();

        const claimNftResourceAddressSet = new Set(
          validators.map((validator) => validator.claimNftResourceAddress)
        );

        const lsuResourceAddressSet = new Set(
          validators.map((validator) => validator.lsuResourceAddress)
        );

        const nonFungibleBalanceResults = yield* getNonFungibleBalanceService({
          addresses: input.addresses,
          at_ledger_state: input.at_ledger_state,
        }).pipe(Effect.withSpan("getNonFungibleBalanceService"));

        const fungibleBalanceResults = yield* getFungibleBalanceService({
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
          items: results,
        };
      });
    };
  })
);

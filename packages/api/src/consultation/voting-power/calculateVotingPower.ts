import { Effect } from "effect";
import {
  GetFungibleBalanceService,
  type StateEntityDetailsInput,
} from "../../common/gateway/getFungibleBalance";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import { GetUserStakingPositionsService } from "../../common/staking/getUserStakingPositions";
import { GetLsulpService } from "../../common/dapps/caviarnine/getLsulp";

export const calculateVotingPower = (input: {
  addresses: string[];
  state?: StateEntityDetailsInput["state"];
}) =>
  Effect.gen(function* () {
    yield* Effect.logTrace(input);
    const getFungibleBalanceService = yield* GetFungibleBalanceService;
    const getLsulpService = yield* GetLsulpService;
    const getUserStakingPositionsService =
      yield* GetUserStakingPositionsService;

    const userStakingPositions = yield* getUserStakingPositionsService({
      addresses: input.addresses,
      state: input.state,
    });

    const lsulpResults = yield* getLsulpService({
      addresses: input.addresses,
      state: input.state,
    });

    const fungibleBalanceResults = yield* getFungibleBalanceService({
      addresses: input.addresses,
      state: input.state,
    }).pipe(Effect.withSpan("getFungibleBalanceService"));

    return fungibleBalanceResults.map((item) => {
      const xrd =
        item.fungibleResources.find(
          (resource) => resource.resourceAddress === Assets.Fungible.XRD
        )?.amount ?? new BigNumber(0);

      const lsulp =
        lsulpResults.find((result) => result.address === item.address)?.lsulp
          .amount ?? new BigNumber(0);

      const stakingPosition = userStakingPositions.items.find(
        (position) => position.address === item.address
      );

      const staked = stakingPosition?.staked ?? [];

      const lsus = staked.reduce(
        (acc, resource) => acc.plus(resource.amount),
        new BigNumber(0)
      );

      const unstaked = stakingPosition?.unstaked ?? [];

      const unstakedClaims = unstaked.reduce(
        (acc, resource) => acc.plus(resource.amount),
        new BigNumber(0)
      );

      return {
        address: item.address,
        xrd,
        lsus,
        unstaked: unstakedClaims,
        lsulp,
      };
    });
  });

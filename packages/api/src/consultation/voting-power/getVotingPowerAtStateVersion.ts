import { Effect } from "effect";
import { GetFungibleBalanceService } from "../../common/gateway/getFungibleBalance";
import { BigNumber } from "bignumber.js";
import { Assets, CaviarNineConstants } from "data";
import { GetUserStakingPositionsService } from "../../common/staking/getUserStakingPositions";
import { GetLsulpService } from "../../common/dapps/caviarnine/getLsulp";
import { GetLedgerStateService } from "../../common/gateway/getLedgerState";
import { GetLsulpValueService } from "../../common/dapps/caviarnine/getLsulpValue";
import { ConvertLsuToXrdService } from "../../common/staking/convertLsuToXrd";
import { GetWeftFinancePositionsService } from "../../common/dapps/weftFinance/getWeftFinancePositions";
import { GetRootFinancePositionsService } from "../../common/dapps/rootFinance/getRootFinancePositions";
import { validateStateInput } from "./schemas";
import type { AtLedgerState } from "../../common/gateway/schemas";

export type GetVotingPowerAtStateVersionInput = {
  addresses: string[];
  at_ledger_state: AtLedgerState;
};

export type GetVotingPowerAtStateVersionOutputItem = {
  address: string;
  votingPower: BigNumber;
  balances: {
    xrd: string;
    lsus: string;
    unstaked: string;
    lsulp: string;
    weftXrd: string;
    weftLsulp: string;
    rootXrd: string;
    rootLsulp: string;
  };
};

export type GetVotingPowerAtStateVersionOutput =
  GetVotingPowerAtStateVersionOutputItem[];

export class GetVotingPowerAtStateVersionService extends Effect.Service<GetVotingPowerAtStateVersionService>()(
  "GetVotingPowerAtStateVersionService",
  {
    effect: Effect.gen(function* () {
      const getFungibleBalanceService = yield* GetFungibleBalanceService;
      const getLsulpService = yield* GetLsulpService;
      const getUserStakingPositionsService =
        yield* GetUserStakingPositionsService;
      const getLsulpValueService = yield* GetLsulpValueService;
      const convertLsuToXrdService = yield* ConvertLsuToXrdService;
      const getWeftFinancePositionsService =
        yield* GetWeftFinancePositionsService;
      const getRootFinancePositionsService =
        yield* GetRootFinancePositionsService;
      const getLedgerStateService = yield* GetLedgerStateService;

      return {
        run: Effect.fn(function* (input: {
          addresses: string[];
          at_ledger_state: AtLedgerState;
        }) {
          yield* validateStateInput(input.at_ledger_state);

          // convert timestamp to state version
          const { state_version } = yield* getLedgerStateService({
            at_ledger_state: input.at_ledger_state,
          }).pipe(Effect.withSpan("getLedgerStateService"));

          const atLedgerState = {
            state_version,
          } satisfies AtLedgerState;

          yield* Effect.logTrace(input);
          const userStakingPositions = yield* getUserStakingPositionsService({
            addresses: input.addresses,
            at_ledger_state: atLedgerState,
          }).pipe(Effect.withSpan("getUserStakingPositionsService"));

          const lsulpResults = yield* getLsulpService({
            addresses: input.addresses,
            at_ledger_state: atLedgerState,
          }).pipe(Effect.withSpan("getLsulpService"));

          const fungibleBalanceResults = yield* getFungibleBalanceService({
            addresses: input.addresses,
            at_ledger_state: atLedgerState,
          }).pipe(Effect.withSpan("getFungibleBalanceService"));

          const lsulpValue = yield* getLsulpValueService({
            at_ledger_state: atLedgerState,
          }).pipe(Effect.withSpan("getLsulpValueService"));

          const weftFinancePositions = yield* getWeftFinancePositionsService
            .run({
              accountAddresses: input.addresses,
              at_ledger_state: atLedgerState,
              // TODO: add validator claim nft map
              validatorClaimNftMap: new Map(),
            })
            .pipe(Effect.withSpan("getWeftFinancePositionsService"));

          const rootFinancePositions = yield* getRootFinancePositionsService
            .run({
              accountAddresses: input.addresses,
              at_ledger_state: atLedgerState,
            })
            .pipe(Effect.withSpan("getRootFinancePositionsService"));

          const lsuResourceAddresses = [
            ...new Set(
              userStakingPositions.items.flatMap((item) =>
                item.staked.map((item) => item.resourceAddress)
              )
            ),
          ];

          const convertLsuToXrdMap = yield* convertLsuToXrdService({
            addresses: lsuResourceAddresses,
            at_ledger_state: atLedgerState,
          }).pipe(
            Effect.map(
              (results) =>
                new Map(
                  results.map((item) => [
                    item.lsuResourceAddress,
                    item.converter,
                  ])
                )
            ),
            Effect.withSpan("convertLsuToXrdService")
          );

          const results: GetVotingPowerAtStateVersionOutput = [];

          for (const item of fungibleBalanceResults) {
            const xrd =
              item.fungibleResources.find(
                (resource) => resource.resourceAddress === Assets.Fungible.XRD
              )?.amount ?? new BigNumber(0);

            const lsulp =
              lsulpResults.find((result) => result.address === item.address)
                ?.lsulp.amount ?? new BigNumber(0);

            const stakingPosition = userStakingPositions.items.find(
              (position) => position.address === item.address
            );

            const staked = stakingPosition?.staked ?? [];

            let stakedXrd = new BigNumber(0);

            for (const stakedItem of staked) {
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              const converter = convertLsuToXrdMap.get(
                stakedItem.resourceAddress
              )!;
              const xrdStaked = converter(stakedItem.amount);
              stakedXrd = stakedXrd.plus(xrdStaked);
            }

            const lsus = staked.reduce(
              (acc, resource) => acc.plus(resource.amount),
              new BigNumber(0)
            );

            const unstaked = stakingPosition?.unstaked ?? [];

            const unstakedClaims = unstaked.reduce(
              (acc, resource) => acc.plus(resource.amount),
              new BigNumber(0)
            );

            const weftFinanceAccountPositions = weftFinancePositions.find(
              (position) => position.address === item.address
            );

            const weftFinanceLending =
              weftFinanceAccountPositions?.lending.reduce(
                (acc, position) => {
                  if (
                    position.unwrappedAsset.resourceAddress ===
                    Assets.Fungible.XRD
                  ) {
                    acc.xrd = acc.xrd.plus(position.unwrappedAsset.amount);
                  }

                  if (
                    position.unwrappedAsset.resourceAddress ===
                    CaviarNineConstants.LSULP.resourceAddress
                  ) {
                    acc.lsulp = acc.lsulp.plus(position.unwrappedAsset.amount);
                  }

                  return acc;
                },
                { xrd: new BigNumber(0), lsulp: new BigNumber(0) }
              ) ?? { xrd: new BigNumber(0), lsulp: new BigNumber(0) };

            const rootFinanceAccountPositions = rootFinancePositions.items.find(
              (position) => position.accountAddress === item.address
            );

            const rootFinanceLending =
              rootFinanceAccountPositions?.collaterizedDebtPositions.reduce(
                (acc, position) => {
                  if (position.nft.resourceAddress === Assets.Fungible.XRD) {
                    acc.xrd = acc.xrd.plus(
                      position.loans?.[Assets.Fungible.XRD] ?? "0"
                    );
                  }

                  if (
                    position.nft.resourceAddress ===
                    CaviarNineConstants.LSULP.resourceAddress
                  ) {
                    acc.lsulp = acc.lsulp.plus(
                      position.loans?.[
                        CaviarNineConstants.LSULP.resourceAddress
                      ] ?? "0"
                    );
                  }
                  return acc;
                },
                { xrd: new BigNumber(0), lsulp: new BigNumber(0) }
              ) ?? { xrd: new BigNumber(0), lsulp: new BigNumber(0) };

            const votingPower = new BigNumber(0)
              .plus(xrd)
              .plus(lsulp.multipliedBy(lsulpValue.lsulpValue))
              .plus(unstakedClaims)
              .plus(stakedXrd)
              .plus(weftFinanceLending.xrd)
              .plus(
                weftFinanceLending.lsulp.multipliedBy(lsulpValue.lsulpValue)
              )
              .plus(rootFinanceLending.xrd)
              .plus(
                rootFinanceLending.lsulp.multipliedBy(lsulpValue.lsulpValue)
              );

            const resultItem = {
              address: item.address,
              balances: {
                xrd: xrd.toString(),
                lsus: lsus.toString(),
                lsulp: lsulp.toString(),
                unstaked: unstakedClaims.toString(),
                weftXrd: weftFinanceLending.xrd.toString(),
                weftLsulp: weftFinanceLending.lsulp.toString(),
                rootXrd: rootFinanceLending.xrd.toString(),
                rootLsulp: rootFinanceLending.lsulp.toString(),
              },

              votingPower,
            };

            results.push(resultItem);
          }

          return results;
        }),
      };
    }),
  }
) {}

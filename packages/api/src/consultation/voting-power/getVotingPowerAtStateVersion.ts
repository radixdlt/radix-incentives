import { Context, Effect, Layer } from "effect";
import {
  GetFungibleBalanceService,
  type InvalidInputError,
} from "../../common/gateway/getFungibleBalance";
import { BigNumber } from "bignumber.js";
import { Assets } from "../../common/assets/constants";
import { GetUserStakingPositionsService } from "../../common/staking/getUserStakingPositions";
import { GetLsulpService } from "../../common/dapps/caviarnine/getLsulp";
import type { GatewayApiClientService } from "../../common/gateway/gatewayApiClient";
import type { EntityFungiblesPageService } from "../../common/gateway/entityFungiblesPage";
import { GetLedgerStateService } from "../../common/gateway/getLedgerState";
import type { GetNonFungibleBalanceServiceDependencies } from "../../common/gateway/getNonFungibleBalance";
import type {
  GetAllValidatorsError,
  GetAllValidatorsService,
} from "../../common/gateway/getAllValidators";
import type { EntityNonFungiblesPageService } from "../../common/gateway/entityNonFungiblesPage";
import type {
  EntityNotFoundError,
  GatewayError,
} from "../../common/gateway/errors";
import {
  GetLsulpValueService,
  type InvalidEntityAddressError,
  type LsulpNotFoundError,
} from "../../common/dapps/caviarnine/getLsulpValue";
import {
  ConvertLsuToXrdService,
  type EntityDetailsNotFoundError,
  type InvalidAmountError,
  type InvalidNativeResourceKindError,
  type InvalidResourceError,
} from "../../common/staking/convertLsuToXrd";
import type {
  GetEntityDetailsError,
  GetEntityDetailsService,
} from "../../common/gateway/getEntityDetails";
import {
  type FailedToParseLendingPoolSchemaError,
  type FailedToParseCDPDataError,
  GetWeftFinancePositionsService,
} from "../../common/dapps/weftFinance/getWeftFinancePositions";
import type { InvalidComponentStateError } from "../../common/gateway/getComponentState";
import type { GetKeyValueStoreService } from "../../common/gateway/getKeyValueStore";
import type { KeyValueStoreDataService } from "../../common/gateway/keyValueStoreData";
import type { KeyValueStoreKeysService } from "../../common/gateway/keyValueStoreKeys";
import { CaviarNineConstants } from "../../common/dapps/caviarnine/constants";
import {
  GetRootFinancePositionsService,
  type InvalidRootReceiptItemError,
  type ParseSborError,
} from "../../common/dapps/rootFinance/getRootFinancePositions";
import { type InvalidStateInputError, validateStateInput } from "./schemas";
import type { UnknownException } from "effect/Cause";
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

export class GetVotingPowerAtStateVersionService extends Context.Tag(
  "GetVotingPowerAtStateVersionService"
)<
  GetVotingPowerAtStateVersionService,
  (input: {
    addresses: string[];
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<
    GetVotingPowerAtStateVersionOutput,
    | GetAllValidatorsError
    | GetEntityDetailsError
    | LsulpNotFoundError
    | InvalidEntityAddressError
    | InvalidResourceError
    | InvalidNativeResourceKindError
    | InvalidAmountError
    | EntityDetailsNotFoundError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | InvalidComponentStateError
    | FailedToParseLendingPoolSchemaError
    | FailedToParseCDPDataError
    | ParseSborError
    | InvalidRootReceiptItemError
    | InvalidStateInputError
    | UnknownException,
    | GetFungibleBalanceService
    | GetLsulpService
    | GetUserStakingPositionsService
    | GatewayApiClientService
    | EntityFungiblesPageService
    | GetLedgerStateService
    | GetNonFungibleBalanceServiceDependencies
    | GetAllValidatorsService
    | EntityNonFungiblesPageService
    | GetLsulpValueService
    | ConvertLsuToXrdService
    | GetEntityDetailsService
    | GetWeftFinancePositionsService
    | GetKeyValueStoreService
    | KeyValueStoreDataService
    | KeyValueStoreKeysService
    | GetRootFinancePositionsService
  >
>() {}

export const GetVotingPowerAtStateVersionLive = Layer.effect(
  GetVotingPowerAtStateVersionService,
  Effect.gen(function* () {
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

    return (input) => {
      return Effect.gen(function* () {
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

        const weftFinancePositions = yield* getWeftFinancePositionsService({
          accountAddresses: input.addresses,
          at_ledger_state: atLedgerState,
        }).pipe(Effect.withSpan("getWeftFinancePositionsService"));

        const rootFinancePositions = yield* getRootFinancePositionsService({
          accountAddresses: input.addresses,
          at_ledger_state: atLedgerState,
        }).pipe(Effect.withSpan("getRootFinancePositionsService"));

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
                results.map((item) => [item.lsuResourceAddress, item.converter])
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
            .plus(weftFinanceLending.lsulp.multipliedBy(lsulpValue.lsulpValue))
            .plus(rootFinanceLending.xrd)
            .plus(rootFinanceLending.lsulp.multipliedBy(lsulpValue.lsulpValue));

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
      });
    };
  })
);

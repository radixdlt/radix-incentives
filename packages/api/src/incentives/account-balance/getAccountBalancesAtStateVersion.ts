import { Context, Effect, Layer } from "effect";
import {
  GetFungibleBalanceService,
  type InvalidInputError,
} from "../../common/gateway/getFungibleBalance";

import { GetUserStakingPositionsService } from "../../common/staking/getUserStakingPositions";
import { GetLsulpService } from "../../common/dapps/caviarnine/getLsulp";
import type { GatewayApiClientService } from "../../common/gateway/gatewayApiClient";

import type { EntityFungiblesPageService } from "../../common/gateway/entityFungiblesPage";
import { GetLedgerStateService } from "../../common/gateway/getLedgerState";
import { GetNonFungibleBalanceService } from "../../common/gateway/getNonFungibleBalance";
import type {
  GetAllValidatorsError,
  GetAllValidatorsService,
  Validator,
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
  type GetWeftFinancePositionsOutput,
  GetWeftFinancePositionsService,
} from "../../common/dapps/weftFinance/getWeftFinancePositions";
import type {
  GetComponentStateService,
  InvalidComponentStateError,
} from "../../common/gateway/getComponentState";
import type { GetKeyValueStoreService } from "../../common/gateway/getKeyValueStore";
import type { KeyValueStoreDataService } from "../../common/gateway/keyValueStoreData";
import type { KeyValueStoreKeysService } from "../../common/gateway/keyValueStoreKeys";
import { CaviarNineConstants } from "../../common/dapps/caviarnine/constants";
import {
  type CollaterizedDebtPosition,
  GetRootFinancePositionsService,
  type InvalidRootReceiptItemError,
  type ParseSborError,
  type FailedToParseLendingPoolStateError,
  type FailedToParsePoolStatesKeyError,
  type MissingConversionRatioError,
} from "../../common/dapps/rootFinance/getRootFinancePositions";
import {
  type InvalidStateInputError,
  validateAtLedgerStateInput,
} from "../../common/gateway/schemas";
import type { AtLedgerState } from "../../common/gateway/schemas";
import {
  GetShapeLiquidityAssetsService,
  type ShapeLiquidityAsset,
} from "../../common/dapps/caviarnine/getShapeLiquidityAssets";
import type { EntityNonFungibleDataService } from "../../common/gateway/entityNonFungiblesData";
import type {
  FailedToParseComponentStateError,
  GetQuantaSwapBinMapService,
} from "../../common/dapps/caviarnine/getQuantaSwapBinMap";
import type {
  FailedToParseLiquidityClaimsError,
  GetShapeLiquidityClaimsService,
} from "../../common/dapps/caviarnine/getShapeLiquidityClaims";
import type {
  LedgerState,
  ProgrammaticScryptoSborValue,
} from "@radixdlt/babylon-gateway-api-sdk";
import type { GetNftResourceManagersServiceDependencies } from "../../common/gateway/getNftResourceManagers";
import BigNumber from "bignumber.js";
import { RootFinance } from "../../common/dapps/rootFinance/constants";

type Lsu = {
  resourceAddress: string;
  amount: BigNumber;
  xrdAmount: BigNumber;
};

type Unstaked = {
  resourceAddress: string;
  amount: BigNumber;
};

type Lsulp = {
  resourceAddress: string;
  amount: BigNumber;
  lsulpValue: BigNumber;
};

type FungibleTokenBalance = {
  resourceAddress: string;
  amount: BigNumber;
  lastUpdatedStateVersion: number;
};

type NonFungibleTokenBalance = {
  resourceAddress: string;
  items: {
    id: string;
    lastUpdatedStateVersion: number;
    sbor?: ProgrammaticScryptoSborValue;
    isBurned: boolean;
  }[];
};

type WeftFinancePosition = GetWeftFinancePositionsOutput["lending"];

type RootFinancePosition = CollaterizedDebtPosition;

type CaviarNinePosition = {
  xrdUsdc: ShapeLiquidityAsset[];
};

export type AccountBalance = {
  address: string;
  staked: Lsu[];
  unstaked: Unstaked[];
  lsulp: Lsulp;
  fungibleTokenBalances: FungibleTokenBalance[];
  nonFungibleTokenBalances: NonFungibleTokenBalance[];
  weftFinancePositions: WeftFinancePosition;
  rootFinancePositions: RootFinancePosition[];
  caviarninePositions: CaviarNinePosition;
};

export type GetAccountBalancesAtStateVersionServiceError =
  | GetAllValidatorsError
  | GetEntityDetailsError
  | LsulpNotFoundError
  | InvalidEntityAddressError
  | InvalidResourceError
  | InvalidNativeResourceKindError
  | InvalidAmountError
  | EntityDetailsNotFoundError
  | FailedToParseLendingPoolSchemaError
  | ParseSborError
  | InvalidRootReceiptItemError
  | FailedToParseLendingPoolStateError
  | FailedToParsePoolStatesKeyError
  | MissingConversionRatioError
  | InvalidStateInputError
  | FailedToParseComponentStateError
  | GatewayError
  | EntityNotFoundError
  | InvalidInputError
  | InvalidComponentStateError
  | FailedToParseLiquidityClaimsError;

export class GetAccountBalancesAtStateVersionService extends Context.Tag(
  "GetAccountBalancesAtStateVersionService"
)<
  GetAccountBalancesAtStateVersionService,
  (input: {
    addresses: string[];
    at_ledger_state: AtLedgerState;
    validators: Validator[];
  }) => Effect.Effect<
    {
      items: AccountBalance[];
      ledgerState: LedgerState;
    },
    GetAccountBalancesAtStateVersionServiceError,
    | GetFungibleBalanceService
    | GetLsulpService
    | GetUserStakingPositionsService
    | GatewayApiClientService
    | EntityFungiblesPageService
    | GetLedgerStateService
    | GetNonFungibleBalanceService
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
    | GetShapeLiquidityAssetsService
    | EntityNonFungibleDataService
    | GetComponentStateService
    | GetQuantaSwapBinMapService
    | GetShapeLiquidityClaimsService
    | GetNftResourceManagersServiceDependencies
  >
>() {}

export const GetAccountBalancesAtStateVersionLive = Layer.effect(
  GetAccountBalancesAtStateVersionService,
  Effect.gen(function* () {
    const getFungibleBalanceService = yield* GetFungibleBalanceService;
    const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;
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
    const getShapeLiquidityAssetsService =
      yield* GetShapeLiquidityAssetsService;
    return (input) =>
      Effect.gen(function* () {
        yield* validateAtLedgerStateInput(input.at_ledger_state);

        // convert timestamp to state version
        const ledgerState = yield* getLedgerStateService({
          at_ledger_state: input.at_ledger_state,
        }).pipe(Effect.withSpan("getLedgerStateService"));

        const state_version = ledgerState.state_version;

        const atLedgerState = {
          state_version,
        } satisfies AtLedgerState;

        yield* Effect.log("getting non fungible and fungible balance");
        const [nonFungibleBalanceResults, fungibleBalanceResults] =
          yield* Effect.all(
            [
              getNonFungibleBalanceService({
                addresses: input.addresses,
                at_ledger_state: atLedgerState,
                resourceAddresses: [
                  CaviarNineConstants.shapeLiquidityPools.XRD_xUSDC
                    .liquidity_receipt,
                  RootFinance.receiptResourceAddress,
                  ...input.validators.map(
                    (validator) => validator.claimNftResourceAddress
                  ),
                ],
              }).pipe(Effect.withSpan("getNonFungibleBalanceService")),
              getFungibleBalanceService({
                addresses: input.addresses,
                at_ledger_state: atLedgerState,
              }).pipe(Effect.withSpan("getFungibleBalanceService")),
            ],
            { concurrency: "unbounded" }
          );

        const C9Pool_XRD_xUSDC =
          CaviarNineConstants.shapeLiquidityPools.XRD_xUSDC;

        yield* Effect.log(
          "getting user staking positions, lsulp, weft finance positions, root finance positions, xrd usdc shape liquidity assets, lsulp value"
        );
        const [
          userStakingPositions,
          lsulpResults,
          allWeftFinancePositions,
          allRootFinancePositions,
          xrdUsdcShapeLiquidityAssets,
          lsulpValue,
        ] = yield* Effect.all(
          [
            getUserStakingPositionsService({
              addresses: input.addresses,
              at_ledger_state: atLedgerState,
              nonFungibleBalance: nonFungibleBalanceResults,
              fungibleBalance: fungibleBalanceResults,
            }).pipe(Effect.withSpan("getUserStakingPositionsService")),
            getLsulpService({
              addresses: input.addresses,
              at_ledger_state: atLedgerState,
              fungibleBalance: fungibleBalanceResults,
            }).pipe(Effect.withSpan("getLsulpService")),
            getWeftFinancePositionsService({
              accountAddresses: input.addresses,
              at_ledger_state: atLedgerState,
              fungibleBalance: fungibleBalanceResults,
            }).pipe(Effect.withSpan("getWeftFinancePositionsService")),
            getRootFinancePositionsService({
              accountAddresses: input.addresses,
              at_ledger_state: atLedgerState,
              nonFungibleBalance: nonFungibleBalanceResults,
            }).pipe(Effect.withSpan("getRootFinancePositionsService")),
            getShapeLiquidityAssetsService({
              addresses: input.addresses,
              at_ledger_state: atLedgerState,
              componentAddress: C9Pool_XRD_xUSDC.componentAddress,
              priceBounds: {
                lower: 0.7,
                upper: 1.3,
              },
              nonFungibleBalance: nonFungibleBalanceResults,
            }).pipe(
              Effect.withSpan("C9Pool_XRD_xUSDC_getShapeLiquidityAssetsService")
            ),
            getLsulpValueService({
              at_ledger_state: atLedgerState,
            }).pipe(Effect.withSpan("getLsulpValueService")),
          ],
          { concurrency: "unbounded" }
        );

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

        const accountBalances = yield* Effect.forEach(
          input.addresses,
          (address) =>
            Effect.gen(function* () {
              const accountStakingPositions = userStakingPositions.items.find(
                (item) => item.address === address
              );

              const staked: Lsu[] =
                accountStakingPositions?.staked.map((item) => ({
                  resourceAddress: item.resourceAddress,
                  amount: item.amount,
                  // biome-ignore lint/style/noNonNullAssertion: <explanation>
                  xrdAmount: convertLsuToXrdMap.get(item.resourceAddress)!(
                    item.amount
                  ),
                })) ?? [];

              const unstaked: Unstaked[] =
                accountStakingPositions?.unstaked.map((item) => ({
                  resourceAddress: item.resourceAddress,
                  amount: item.amount,
                })) ?? [];

              const lsulpPosition = lsulpResults.find(
                (item) => item.address === address
              )?.lsulp;
              const lsulp: Lsulp = {
                resourceAddress:
                  lsulpPosition?.resourceAddress ??
                  CaviarNineConstants.LSULP.resourceAddress,
                amount: lsulpPosition?.amount ?? new BigNumber(0),
                lsulpValue: lsulpValue.lsulpValue,
              };

              const fungibleTokenBalances: FungibleTokenBalance[] =
                fungibleBalanceResults.find((item) => item.address === address)
                  ?.fungibleResources ?? [];

              const nonFungibleTokenBalances: NonFungibleTokenBalance[] =
                nonFungibleBalanceResults.items.find(
                  (item) => item.address === address
                )?.nonFungibleResources ?? [];

              const weftFinancePositions: WeftFinancePosition =
                allWeftFinancePositions.find((item) => item.address === address)
                  ?.lending ?? [];

              const rootFinancePositions: RootFinancePosition[] =
                allRootFinancePositions.items.find(
                  (item) => item.accountAddress === address
                )?.collaterizedDebtPositions ?? [];

              const accountXRD_xUSDC_ShapeLiquidityAssets: ShapeLiquidityAsset[] =
                xrdUsdcShapeLiquidityAssets.find(
                  (item) => item.address === address
                )?.items ?? [];

              return {
                address,
                staked,
                unstaked,
                lsulp,
                fungibleTokenBalances,
                nonFungibleTokenBalances,
                weftFinancePositions,
                rootFinancePositions,
                caviarninePositions: {
                  xrdUsdc: accountXRD_xUSDC_ShapeLiquidityAssets,
                },
              } satisfies AccountBalance;
            })
        );

        yield* Effect.log("account balances fetched");

        return { items: accountBalances, ledgerState };
      });
  })
);

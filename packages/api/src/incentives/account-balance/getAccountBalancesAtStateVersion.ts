import { Context, Effect, Layer } from "effect";
import {
  GetFungibleBalanceService,
  type InvalidInputError,
} from "../../common/gateway/getFungibleBalance";

import { GetUserStakingPositionsService } from "../../common/staking/getUserStakingPositions";
import { GetLsulpService } from "../../common/dapps/caviarnine/getLsulp";

import { GetLedgerStateService } from "../../common/gateway/getLedgerState";
import { GetNonFungibleBalanceService } from "../../common/gateway/getNonFungibleBalance";
import type {
  GetAllValidatorsError,
  Validator,
} from "../../common/gateway/getAllValidators";
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
import type { GetEntityDetailsError } from "../../common/gateway/getEntityDetails";
import {
  type FailedToParseLendingPoolSchemaError,
  type FailedToParseCDPDataError,
  type GetWeftFinancePositionsOutput,
  type ValidatorNotFoundForClaimNftError,
  GetWeftFinancePositionsService,
} from "../../common/dapps/weftFinance/getWeftFinancePositions";
import type { FailedToParseUnstakingReceiptError } from "../../common/staking/unstakingReceiptProcessor";
import type { InvalidComponentStateError } from "../../common/gateway/getComponentState";
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
import {
  GetOciswapLiquidityAssetsService,
  type OciswapLiquidityAsset,
} from "../../common/dapps/ociswap/getOciswapLiquidityAssets";
import { OciswapConstants } from "../../common/dapps/ociswap/constants";
import type { FailedToParseComponentStateError } from "../../common/dapps/caviarnine/getQuantaSwapBinMap";
import type { FailedToParseLiquidityClaimsError } from "../../common/dapps/caviarnine/getShapeLiquidityClaims";
import type { FailedToParseOciswapComponentStateError } from "../../common/dapps/ociswap/getOciswapLiquidityAssets";
import type { FailedToParseOciswapLiquidityPositionError } from "../../common/dapps/ociswap/getOciswapLiquidityClaims";
import {
  type GetDefiPlazaPositionsOutput,
  GetDefiPlazaPositionsService,
  type GetDefiPlazaPositionsError,
} from "../../common/dapps/defiplaza/getDefiPlazaPositions";
import {
  type GetHyperstakePositionsOutput,
  GetHyperstakePositionsService,
  type GetHyperstakePositionsError,
} from "../../common/dapps/caviarnine/getHyperstakePositions";
import {
  type GetSurgeLiquidityPositionsOutput,
  GetSurgeLiquidityPositionsService,
  type FailedToParseMarginPoolSchemaError,
  type SlpNotFoundError,
} from "../../common/dapps/surge/getSurgeLiquidityPositions";
import {
  GetOciswapResourcePoolPositionsService,
  type InvalidResourcePoolError,
} from "../../common/dapps/ociswap/getOciswapResourcePoolPositions";
import type {
  LedgerState,
  ProgrammaticScryptoSborValue,
} from "@radixdlt/babylon-gateway-api-sdk";
import BigNumber from "bignumber.js";
import { RootFinance } from "../../common/dapps/rootFinance/constants";
import { Assets } from "../../common/assets/constants";
import { WeftFinance } from "../../common/dapps/weftFinance/constants";

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

type WeftFinancePosition = GetWeftFinancePositionsOutput;

type RootFinancePosition = CollaterizedDebtPosition;

type CaviarNinePosition = {
  [key: string]: ShapeLiquidityAsset[];
};

type OciswapPosition = {
  [key: string]: OciswapLiquidityAsset[];
};

type DefiPlazaPosition = GetDefiPlazaPositionsOutput[number];

type HyperstakePosition = GetHyperstakePositionsOutput[number];

type SurgePosition = GetSurgeLiquidityPositionsOutput[number];

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
  ociswapPositions: OciswapPosition;
  defiPlazaPositions: DefiPlazaPosition;
  hyperstakePositions: HyperstakePosition;
  surgePositions: SurgePosition;
  convertLsuToXrdMap: Map<string, (amount: BigNumber) => BigNumber>;
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
  | FailedToParseCDPDataError
  | FailedToParseUnstakingReceiptError
  | ValidatorNotFoundForClaimNftError
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
  | FailedToParseLiquidityClaimsError
  | FailedToParseOciswapComponentStateError
  | FailedToParseOciswapLiquidityPositionError
  | GetDefiPlazaPositionsError
  | GetHyperstakePositionsError
  | FailedToParseMarginPoolSchemaError
  | SlpNotFoundError
  | InvalidResourcePoolError;

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
    GetAccountBalancesAtStateVersionServiceError
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
    const getOciswapLiquidityAssetsService =
      yield* GetOciswapLiquidityAssetsService;
    const getDefiPlazaPositionsService = yield* GetDefiPlazaPositionsService;
    const getHyperstakePositionsService = yield* GetHyperstakePositionsService;
    const getSurgeLiquidityPositionsService =
      yield* GetSurgeLiquidityPositionsService;
    const getOciswapResourcePoolPositionsService =
      yield* GetOciswapResourcePoolPositionsService;
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

        // Create validator claim NFT mapping for Weft Finance processing
        const validatorClaimNftMap = new Map(
          input.validators.map((validator) => [
            validator.address,
            validator.claimNftResourceAddress,
          ])
        );

        yield* Effect.log("getting non fungible and fungible balance");
        const [nonFungibleBalanceResults, fungibleBalanceResults] =
          yield* Effect.all(
            [
              getNonFungibleBalanceService({
                addresses: input.addresses,
                at_ledger_state: atLedgerState,
                resourceAddresses: [
                  ...Object.values(CaviarNineConstants.shapeLiquidityPools).map(
                    (pool) => pool.liquidity_receipt
                  ),
                  ...Object.values(OciswapConstants.pools).map(
                    (pool) => pool.lpResourceAddress
                  ),
                  ...Object.values(OciswapConstants.poolsV2).map(
                    (pool) => pool.lpResourceAddress
                  ),
                  RootFinance.receiptResourceAddress,
                  WeftFinance.v2.WeftyV2.resourceAddress,
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

        const allCaviarNinePools = Object.values(
          CaviarNineConstants.shapeLiquidityPools
        );

        const allOciswapPools = Object.values(OciswapConstants.pools);
        const allOciswapPoolsV2 = Object.values(OciswapConstants.poolsV2);

        yield* Effect.log(
          "getting user staking positions, lsulp, weft finance positions, root finance positions, all caviarnine shape liquidity assets, all ociswap liquidity assets, defi plaza positions, hyperstake positions, surge liquidity positions, ociswap resource pool positions, lsulp value"
        );
        const [
          userStakingPositions,
          lsulpResults,
          allWeftFinancePositions,
          allRootFinancePositions,
          allCaviarNineShapeLiquidityAssets,
          allOciswapLiquidityAssets,
          allDefiPlazaPositions,
          allHyperstakePositions,
          allSurgeLiquidityPositions,
          allOciswapResourcePoolPositions,
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
            getWeftFinancePositionsService
              .run({
                accountAddresses: input.addresses,
                at_ledger_state: atLedgerState,
                fungibleBalance: fungibleBalanceResults,
                nonFungibleBalance: nonFungibleBalanceResults,
                validatorClaimNftMap: validatorClaimNftMap,
              })
              .pipe(Effect.withSpan("getWeftFinancePositionsService")),
            getRootFinancePositionsService
              .run({
                accountAddresses: input.addresses,
                at_ledger_state: atLedgerState,
                nonFungibleBalance: nonFungibleBalanceResults,
              })
              .pipe(Effect.withSpan("getRootFinancePositionsService")),
            Effect.all(
              allCaviarNinePools.map((pool) =>
                getShapeLiquidityAssetsService({
                  addresses: input.addresses,
                  at_ledger_state: atLedgerState,
                  componentAddress: pool.componentAddress,
                  priceBounds: {
                    lower: 0.7,
                    upper: 1.3,
                  },
                  nonFungibleBalance: nonFungibleBalanceResults,
                }).pipe(
                  Effect.withSpan(
                    `CaviarNine_${pool.name.replace("/", "_")}_getShapeLiquidityAssetsService`
                  ),
                  Effect.map((result) => ({ pool, result }))
                )
              ),
              { concurrency: "unbounded" }
            ),
            Effect.all(
              [
                ...allOciswapPools.map((pool) =>
                  getOciswapLiquidityAssetsService({
                    componentAddress: pool.componentAddress,
                    addresses: input.addresses,
                    at_ledger_state: atLedgerState,
                    lpResourceAddress: pool.lpResourceAddress,
                    tokenXAddress: pool.token_x,
                    tokenYAddress: pool.token_y,
                    tokenXDivisibility: pool.divisibility_x,
                    tokenYDivisibility: pool.divisibility_y,
                    schemaVersion: "v1",
                    priceBounds: {
                      lower: 0.7,
                      upper: 1.3,
                    },
                    nonFungibleBalance: nonFungibleBalanceResults,
                  }).pipe(
                    Effect.withSpan(
                      `OciSwap_${pool.name.replace("/", "_")}_getOciswapLiquidityAssetsService`
                    ),
                    Effect.map((result) => ({ pool, result }))
                  )
                ),
                ...allOciswapPoolsV2.map((pool) =>
                  getOciswapLiquidityAssetsService({
                    componentAddress: pool.componentAddress,
                    addresses: input.addresses,
                    at_ledger_state: atLedgerState,
                    lpResourceAddress: pool.lpResourceAddress,
                    tokenXAddress: pool.token_x,
                    tokenYAddress: pool.token_y,
                    tokenXDivisibility: pool.divisibility_x,
                    tokenYDivisibility: pool.divisibility_y,
                    schemaVersion: "v2",
                    priceBounds: {
                      lower: 0.7,
                      upper: 1.3,
                    },
                    nonFungibleBalance: nonFungibleBalanceResults,
                  }).pipe(
                    Effect.withSpan(
                      `OciSwapV2_${pool.name.replace("/", "_")}_getOciswapLiquidityAssetsService`
                    ),
                    Effect.map((result) => ({ pool, result }))
                  )
                ),
              ],
              { concurrency: "unbounded" }
            ),
            getDefiPlazaPositionsService({
              accountAddresses: input.addresses,
              at_ledger_state: atLedgerState,
              fungibleBalance: fungibleBalanceResults,
            }).pipe(Effect.withSpan("getDefiPlazaPositionsService")),
            getHyperstakePositionsService({
              accountAddresses: input.addresses,
              at_ledger_state: atLedgerState,
              fungibleBalance: fungibleBalanceResults,
            }).pipe(Effect.withSpan("getHyperstakePositionsService")),
            getSurgeLiquidityPositionsService
              .getSurgeLiquidityPositions({
                accountAddresses: input.addresses,
                at_ledger_state: atLedgerState,
                fungibleBalance: fungibleBalanceResults,
              })
              .pipe(Effect.withSpan("getSurgeLiquidityPositionsService")),
            getOciswapResourcePoolPositionsService
              .getOciswapResourcePoolPositions({
                accountAddresses: input.addresses,
                at_ledger_state: atLedgerState,
                fungibleBalance: fungibleBalanceResults,
                // No poolType specified - will fetch both FlexPools and BasicPools
              })
              .pipe(Effect.withSpan("getOciswapResourcePoolPositionsService")),
            getLsulpValueService({
              at_ledger_state: atLedgerState,
            }).pipe(Effect.withSpan("getLsulpValueService")),
          ],
          { concurrency: "unbounded" }
        );

        // Create LSU resource address set from input validators
        const lsuResourceAddressSet = new Set(
          input.validators.map((validator) => validator.lsuResourceAddress)
        );

        // Collect LSU resource addresses from multiple sources
        const directStakingLsus = userStakingPositions.items.flatMap((item) =>
          item.staked.map((item) => item.resourceAddress)
        );

        // Include potential LSUs from Weft Finance collaterals
        // Filter using the lsuResourceAddressSet to only include valid LSUs
        const weftFinanceLsus = allWeftFinancePositions.flatMap((account) =>
          account.collateral
            .map((collateral) => collateral.resourceAddress)
            .filter(
              (address) =>
                address !== Assets.Fungible.XRD &&
                address !== CaviarNineConstants.LSULP.resourceAddress &&
                lsuResourceAddressSet.has(address)
            )
        );

        const lsuResourceAddresses = [
          ...new Set([...directStakingLsus, ...weftFinanceLsus]),
        ];

        // Convert all valid LSUs at once instead of individually
        const validLsuConversions = yield* convertLsuToXrdService({
          addresses: lsuResourceAddresses,
          at_ledger_state: atLedgerState,
        }).pipe(Effect.withSpan("convertLsuToXrdService"));

        const convertLsuToXrdMap = new Map(
          validLsuConversions.map((item) => [
            item.lsuResourceAddress,
            item.converter,
          ])
        );

        // Create lookup maps for O(1) access instead of O(n) find operations
        const stakingPositionsMap = new Map(
          userStakingPositions.items.map((item) => [item.address, item])
        );

        const lsulpMap = new Map(
          lsulpResults.map((item) => [item.address, item.lsulp])
        );

        const fungibleBalanceMap = new Map(
          fungibleBalanceResults.map((item) => [
            item.address,
            item.fungibleResources,
          ])
        );

        const nonFungibleBalanceMap = new Map(
          nonFungibleBalanceResults.items.map((item) => [
            item.address,
            item.nonFungibleResources,
          ])
        );

        const weftFinanceMap = new Map(
          allWeftFinancePositions.map((item) => [item.address, item])
        );

        const rootFinanceMap = new Map(
          allRootFinancePositions.items.map((item) => [
            item.accountAddress,
            item.collaterizedDebtPositions,
          ])
        );

        const defiPlazaMap = new Map(
          allDefiPlazaPositions.map((item) => [item.address, item])
        );

        const caviarNineHyperstakePositions = new Map(
          allHyperstakePositions.map((item) => [item.address, item])
        );

        const surgeLiquidityPositionsMap = new Map(
          allSurgeLiquidityPositions.map((item) => [item.address, item])
        );

        // Create lookup maps for CaviarNine shape liquidity assets for O(1) access
        const caviarNineShapeLiquidityPositions = new Map(
          allCaviarNineShapeLiquidityAssets.map((poolData) => {
            const poolKey = poolData.pool.componentAddress;
            const addressToAssetsMap = new Map(
              poolData.result.map((item) => [item.address, item.items])
            );
            return [poolKey, addressToAssetsMap];
          })
        );

        // Create lookup maps for OciSwap liquidity assets for O(1) access
        const ociswapLiquidityPositions = new Map(
          allOciswapLiquidityAssets.map((poolData) => {
            const poolKey = poolData.pool.componentAddress;
            const addressToAssetsMap = new Map(
              poolData.result.map((item) => [item.address, item.items])
            );
            return [poolKey, addressToAssetsMap];
          })
        );

        // Create lookup maps for FlexPool and BasicPool positions (combined)
        const ociswapResourcePoolLiquidityPositions = new Map(
          allOciswapResourcePoolPositions.map((poolData) => {
            const poolKey = poolData.pool.componentAddress;
            const addressToAssetsMap = new Map(
              poolData.result.map((item) => [item.address, item.items])
            );
            return [poolKey, addressToAssetsMap];
          })
        );

        const accountBalances = yield* Effect.forEach(
          input.addresses,
          (address) =>
            Effect.gen(function* () {
              const accountStakingPositions = stakingPositionsMap.get(address);

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

              const lsulpPosition = lsulpMap.get(address);
              const lsulp: Lsulp = {
                resourceAddress:
                  lsulpPosition?.resourceAddress ??
                  CaviarNineConstants.LSULP.resourceAddress,
                amount: lsulpPosition?.amount ?? new BigNumber(0),
                lsulpValue: lsulpValue.lsulpValue,
              };

              const fungibleTokenBalances: FungibleTokenBalance[] =
                fungibleBalanceMap.get(address) ?? [];

              const nonFungibleTokenBalances: NonFungibleTokenBalance[] =
                nonFungibleBalanceMap.get(address) ?? [];

              const weftFinancePositions: WeftFinancePosition =
                weftFinanceMap.get(address) ?? {
                  address,
                  lending: [],
                  collateral: [],
                  unstakingReceipts: [],
                };

              const rootFinancePositions: RootFinancePosition[] =
                rootFinanceMap.get(address) ?? [];

              const accountDefiPlazaPositions: DefiPlazaPosition =
                defiPlazaMap.get(address) ?? { address, items: [] };

              const accountHyperstakePositions: HyperstakePosition =
                caviarNineHyperstakePositions.get(address) ?? {
                  address,
                  items: [],
                };

              const accountSurgePositions: SurgePosition =
                surgeLiquidityPositionsMap.get(address) ?? {
                  address,
                  liquidityPosition: {
                    resourceAddress: Assets.Fungible.xUSDC,
                    amount: new BigNumber(0),
                  },
                };

              const caviarninePositions: CaviarNinePosition = {};

              for (const [
                poolKey,
                addressToAssetsMap,
              ] of caviarNineShapeLiquidityPositions) {
                const accountPoolAssets = addressToAssetsMap.get(address) ?? [];
                caviarninePositions[poolKey] = accountPoolAssets;
              }

              const ociswapPositions: OciswapPosition = {};

              // Add all Ociswap positions (regular, FlexPools, and BasicPools) using lookup maps
              for (const [
                poolKey,
                addressToAssetsMap,
              ] of ociswapLiquidityPositions) {
                const accountPoolAssets = addressToAssetsMap.get(address) ?? [];
                ociswapPositions[poolKey] = accountPoolAssets;
              }

              for (const [
                poolKey,
                addressToAssetsMap,
              ] of ociswapResourcePoolLiquidityPositions) {
                const accountPoolAssets = addressToAssetsMap.get(address) ?? [];
                ociswapPositions[poolKey] = accountPoolAssets;
              }

              return {
                address,
                staked,
                unstaked,
                lsulp,
                fungibleTokenBalances,
                nonFungibleTokenBalances,
                weftFinancePositions,
                rootFinancePositions,
                caviarninePositions,
                ociswapPositions,
                defiPlazaPositions: accountDefiPlazaPositions,
                hyperstakePositions: accountHyperstakePositions,
                surgePositions: accountSurgePositions,
                convertLsuToXrdMap,
              } satisfies AccountBalance;
            })
        ).pipe(Effect.withSpan("PositionsToAccountBalance"));

        yield* Effect.log("account balances fetched");

        return { items: accountBalances, ledgerState };
      });
  })
);

import { Effect } from "effect";

import {
  type GetNonFungibleBalanceOutput,
  GetNonFungibleBalanceService,
} from "../../gateway/getNonFungibleBalance";
import { DappConstants } from "data";

const RootFinanceConstants = DappConstants.RootFinance.constants;

import {
  CollaterizedDebtPositionData,
  LendingPoolState,
  PoolStatesKeyValueStoreKeySchema,
} from "./schema";
import type { SborError } from "sbor-ez-mode";
import type { AtLedgerState } from "../../gateway/schemas";
import { GetKeyValueStoreService } from "../../gateway/getKeyValueStore";
import { BigNumber } from "bignumber.js";

export class ParseSborError {
  readonly _tag = "ParseSborError";
  constructor(readonly error: SborError) {}
}

export class InvalidRootReceiptItemError extends Error {
  readonly _tag = "InvalidRootReceiptItemError";
}

export class FailedToParseLendingPoolStateError {
  readonly _tag = "FailedToParseLendingPoolStateError";
  constructor(readonly error: unknown) {}
}

export class FailedToParsePoolStatesKeyError {
  readonly _tag = "FailedToParsePoolStatesKeyError";
  constructor(readonly error: SborError) {}
}

export class MissingConversionRatioError {
  readonly _tag = "MissingConversionRatioError";
  constructor(
    readonly resourceAddress: string,
    readonly positionType: "collateral" | "loan"
  ) {}
}

export type GetRootFinancePositionsServiceInput = {
  accountAddresses: string[];
  nonFungibleBalance?: GetNonFungibleBalanceOutput;
  at_ledger_state: AtLedgerState;
};

export type CollaterizedDebtPosition = {
  nft: {
    resourceAddress: ResourceAddress;
    localId: string;
  };
  collaterals: Record<ResourceAddress, Value>;
  loans: Record<ResourceAddress, Value>;
};

export type GetRootFinancePositionsServiceOutput = {
  items: {
    accountAddress: AccountAddress;
    collaterizedDebtPositions: CollaterizedDebtPosition[];
  }[];
};

type AccountAddress = string;
type ResourceAddress = string;
type Value = string;

export class GetRootFinancePositionsService extends Effect.Service<GetRootFinancePositionsService>()(
  "GetRootFinancePositionsService",
  {
    effect: Effect.gen(function* () {
      const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;
      const getKeyValueStoreService = yield* GetKeyValueStoreService;

      const accountCollateralMap = new Map<
        AccountAddress,
        CollaterizedDebtPosition[]
      >();
      return {
        run: Effect.fn(function* (input: GetRootFinancePositionsServiceInput) {
          const poolStatesKvs = yield* getKeyValueStoreService
            .run({
              address: RootFinanceConstants.poolStateKvs,
              at_ledger_state: input.at_ledger_state,
            })
            .pipe(
              Effect.catchTags({
                EntityNotFoundError: () =>
                  Effect.succeed({
                    entries: [],
                  }),
              })
            );

          // Create maps for conversion ratios: pool units -> real amounts
          const collateralConversionRatios = new Map<
            ResourceAddress,
            BigNumber
          >();
          const loanConversionRatios = new Map<ResourceAddress, BigNumber>();

          for (const item of poolStatesKvs.entries) {
            const poolState = LendingPoolState.safeParse(
              item.value.programmatic_json
            );

            if (poolState.isOk()) {
              // Extract resource address from the key using SBOR EZ Mode
              const keyParseResult = PoolStatesKeyValueStoreKeySchema.safeParse(
                item.key.programmatic_json
              );

              if (keyParseResult.isOk()) {
                const resourceAddress = keyParseResult.value;
                const state = poolState.value;

                // For collaterals: multiply by total_deposit / total_deposit_unit
                const totalDepositUnit = new BigNumber(
                  state.total_deposit_unit
                );
                if (state.total_deposit_unit && totalDepositUnit.gt(0)) {
                  const collateralRatio = new BigNumber(
                    state.total_deposit
                  ).div(totalDepositUnit);
                  collateralConversionRatios.set(
                    resourceAddress,
                    collateralRatio
                  );
                }

                // For loans: multiply by total_loan / total_loan_unit
                const totalLoanUnit = new BigNumber(state.total_loan_unit);
                if (state.total_loan_unit && totalLoanUnit.gt(0)) {
                  const loanRatio = new BigNumber(state.total_loan).div(
                    totalLoanUnit
                  );
                  loanConversionRatios.set(resourceAddress, loanRatio);
                }
              } else {
                return yield* Effect.fail(
                  new FailedToParsePoolStatesKeyError(keyParseResult.error)
                );
              }
            } else {
              return yield* Effect.fail(
                new FailedToParseLendingPoolStateError(poolState.error)
              );
            }
          }

          const result = input.nonFungibleBalance
            ? input.nonFungibleBalance
            : yield* getNonFungibleBalanceService({
                addresses: input.accountAddresses,
                at_ledger_state: input.at_ledger_state,
                options: {
                  non_fungible_include_nfids: true,
                },
              }).pipe(Effect.withSpan("getNonFungibleBalanceService"));

          for (const account of result.items) {
            const collaterizedDebtPositionList: CollaterizedDebtPosition[] = [];

            const rootReceipts = account.nonFungibleResources.filter(
              (resource) =>
                resource.resourceAddress ===
                RootFinanceConstants.receiptResourceAddress
            );

            for (const rootReceipt of rootReceipts) {
              const rootReceiptItems = rootReceipt.items;

              for (const rootReceiptItem of rootReceiptItems) {
                const rootReceiptItemSbor = rootReceiptItem.sbor;

                if (!rootReceiptItemSbor) {
                  return yield* Effect.fail(new InvalidRootReceiptItemError());
                }

                const parsed =
                  CollaterizedDebtPositionData.safeParse(rootReceiptItemSbor);

                if (parsed.isErr()) {
                  return yield* Effect.fail(new ParseSborError(parsed.error));
                }

                const collaterizedDebtPosition = parsed.value;

                // Convert pool units to real amounts for collaterals
                const collaterals: Record<ResourceAddress, Value> = {};
                for (const [
                  resourceAddress,
                  unitAmount,
                ] of collaterizedDebtPosition.collaterals.entries()) {
                  if (!unitAmount) {
                    continue; // Skip empty amounts
                  }

                  const conversionRatio =
                    collateralConversionRatios.get(resourceAddress);
                  if (!conversionRatio) {
                    return yield* Effect.fail(
                      new MissingConversionRatioError(
                        resourceAddress,
                        "collateral"
                      )
                    );
                  }

                  const realAmount = new BigNumber(unitAmount).multipliedBy(
                    conversionRatio
                  );
                  collaterals[resourceAddress] = realAmount.toString();
                }

                // Convert pool units to real amounts for loans
                const loans: Record<ResourceAddress, Value> = {};
                for (const [
                  resourceAddress,
                  unitAmount,
                ] of collaterizedDebtPosition.loans.entries()) {
                  if (!unitAmount) {
                    continue; // Skip empty amounts
                  }

                  const conversionRatio =
                    loanConversionRatios.get(resourceAddress);
                  if (!conversionRatio) {
                    return yield* Effect.fail(
                      new MissingConversionRatioError(resourceAddress, "loan")
                    );
                  }

                  const realAmount = new BigNumber(unitAmount).multipliedBy(
                    conversionRatio
                  );
                  loans[resourceAddress] = realAmount.toString();
                }

                collaterizedDebtPositionList.push({
                  nft: {
                    resourceAddress: rootReceipt.resourceAddress,
                    localId: rootReceiptItem.id,
                  },
                  collaterals,
                  loans,
                });
              }
            }

            accountCollateralMap.set(
              account.address,
              collaterizedDebtPositionList
            );
          }

          const items = Array.from(accountCollateralMap.entries()).map(
            ([accountAddress, value]) => ({
              accountAddress,
              collaterizedDebtPositions: value,
            })
          );

          return {
            items,
          };
        }),
      };
    }),
  }
) {}

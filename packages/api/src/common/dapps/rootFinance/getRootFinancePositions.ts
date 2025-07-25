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
import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import { groupBy } from "effect/Array";

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

      const parseRootReceipt = Effect.fn(function* (input: {
        sbor?: ProgrammaticScryptoSborValue;
      }) {
        const rootReceiptItemSbor = input.sbor;

        if (!rootReceiptItemSbor) {
          return yield* Effect.fail(new InvalidRootReceiptItemError());
        }

        const parsed =
          CollaterizedDebtPositionData.safeParse(rootReceiptItemSbor);

        if (parsed.isErr()) {
          return yield* Effect.fail(new ParseSborError(parsed.error));
        }

        return parsed.value;
      });

      const parsePoolState = Effect.fn(function* (item: {
        value: { programmatic_json: ProgrammaticScryptoSborValue };
      }) {
        const poolState = LendingPoolState.safeParse(
          item.value.programmatic_json
        );

        if (poolState.isErr()) {
          return yield* Effect.fail(
            new FailedToParseLendingPoolStateError(poolState.error)
          );
        }

        return poolState.value;
      });

      const parsePoolStateKey = Effect.fn(function* (item: {
        key: { programmatic_json: ProgrammaticScryptoSborValue };
      }) {
        const key = PoolStatesKeyValueStoreKeySchema.safeParse(
          item.key.programmatic_json
        );

        if (key.isErr()) {
          return yield* Effect.fail(
            new FailedToParsePoolStatesKeyError(key.error)
          );
        }

        return key.value;
      });

      return {
        run: Effect.fn(function* (input: GetRootFinancePositionsServiceInput) {
          const poolStatesKvs = yield* getKeyValueStoreService({
            address: RootFinanceConstants.poolStateKvs,
            at_ledger_state: input.at_ledger_state,
          }).pipe(
            Effect.catchTags({
              EntityNotFoundError: () =>
                Effect.succeed({
                  entries: [],
                }),
            })
          );

          const { collateralConversionRatios, loanConversionRatios } =
            yield* Effect.forEach(
              poolStatesKvs.entries,
              Effect.fn(function* (item) {
                const poolState = yield* parsePoolState(item);

                // Extract resource address from the key
                const resourceAddress = yield* parsePoolStateKey(item);

                // For collaterals: multiply by total_deposit / total_deposit_unit
                const totalDepositUnit = new BigNumber(
                  poolState.total_deposit_unit
                );

                const output: {
                  resourceAddress: ResourceAddress;
                  collateralRatio?: BigNumber;
                  loanRatio?: BigNumber;
                }[] = [];

                if (poolState.total_deposit_unit && totalDepositUnit.gt(0)) {
                  const collateralRatio = new BigNumber(
                    poolState.total_deposit
                  ).div(totalDepositUnit);

                  output.push({
                    resourceAddress,
                    collateralRatio,
                  });
                }

                // For loans: multiply by total_loan / total_loan_unit
                const totalLoanUnit = new BigNumber(poolState.total_loan_unit);
                if (poolState.total_loan_unit && totalLoanUnit.gt(0)) {
                  const loanRatio = new BigNumber(poolState.total_loan).div(
                    totalLoanUnit
                  );
                  output.push({
                    resourceAddress,
                    loanRatio,
                  });
                }

                return output;
              }),
              { concurrency: "unbounded" }
            ).pipe(
              Effect.map((items) => {
                const flatItems = items.flat();

                const collateralConversionRatios = new Map<
                  ResourceAddress,
                  BigNumber
                >();

                const loanConversionRatios = new Map<
                  ResourceAddress,
                  BigNumber
                >();

                for (const item of flatItems) {
                  if (item?.collateralRatio) {
                    collateralConversionRatios.set(
                      item.resourceAddress,
                      item.collateralRatio
                    );
                  }
                  if (item?.loanRatio) {
                    loanConversionRatios.set(
                      item.resourceAddress,
                      item.loanRatio
                    );
                  }
                }

                return {
                  collateralConversionRatios,
                  loanConversionRatios,
                };
              })
            );

          const result = input.nonFungibleBalance
            ? input.nonFungibleBalance
            : yield* getNonFungibleBalanceService({
                addresses: input.accountAddresses,
                at_ledger_state: input.at_ledger_state,
                options: {
                  non_fungible_include_nfids: true,
                },
                resourceAddresses: [
                  RootFinanceConstants.receiptResourceAddress,
                ],
              });

          const collaterizedDebtPositions = yield* Effect.forEach(
            result.items,
            Effect.fn(function* (nftResult) {
              const rootReceipts = nftResult.nonFungibleResources.flatMap(
                (resource) =>
                  resource.items.map((item) => ({
                    ...item,
                    resourceAddress: resource.resourceAddress,
                    accountAddress: nftResult.address,
                  }))
              );

              return yield* Effect.forEach(
                rootReceipts,
                Effect.fn(function* (rootReceipt) {
                  const collaterizedDebtPosition =
                    yield* parseRootReceipt(rootReceipt);

                  return {
                    ...rootReceipt,
                    collaterizedDebtPosition,
                  };
                })
              );
            })
          ).pipe(Effect.map((items) => items.flat()));

          const collaterizedDebtPositionsWithRealAmounts =
            yield* Effect.forEach(
              collaterizedDebtPositions,
              Effect.fn(function* ({
                collaterizedDebtPosition,
                resourceAddress,
                id,
                accountAddress,
              }) {
                // Convert pool units to real amounts for collaterals
                const collaterals: Record<ResourceAddress, Value> = {};
                for (const [
                  resourceAddress,
                  unitAmount,
                ] of collaterizedDebtPosition.collaterals.entries()) {
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

                return {
                  accountAddress,
                  nft: {
                    resourceAddress,
                    localId: id,
                  },
                  collaterals,
                  loans,
                };
              }),
              { concurrency: "unbounded" }
            );

          const groupedByAccountAddress = groupBy(
            collaterizedDebtPositionsWithRealAmounts,
            (item) => item.accountAddress
          );

          const output = Object.entries(groupedByAccountAddress).map(
            ([accountAddress, items]) => ({
              accountAddress,
              collaterizedDebtPositions: items.map(
                ({ accountAddress, ...rest }) => ({
                  ...rest,
                })
              ),
            })
          );

          return {
            items: output,
          };
        }),
      };
    }),
  }
) {}

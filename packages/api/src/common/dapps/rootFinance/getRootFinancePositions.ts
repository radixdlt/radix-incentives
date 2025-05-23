import { Context, Effect, Layer } from "effect";

import type { GatewayApiClientService } from "../../gateway/gatewayApiClient";

import type { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";
import type { GetLedgerStateService } from "../../gateway/getLedgerState";
import type { EntityNotFoundError, GatewayError } from "../../gateway/errors";
import {
  GetNonFungibleBalanceService,
  type InvalidInputError,
  type StateEntityDetailsInput,
} from "../../gateway/getNonFungibleBalance";
import type { EntityNonFungiblesPageService } from "../../gateway/entityNonFungiblesPage";
import { RootFinance } from "./constants";

import { CollaterizedDebtPositionData } from "./schema";
import type { SborError } from "@calamari-radix/sbor-ez-mode";
import type { GetEntityDetailsError } from "../../gateway/getEntityDetails";
import type { AtLedgerState } from "../../gateway/schemas";

export class ParseSborError {
  readonly _tag = "ParseSborError";
  constructor(readonly error: SborError) {}
}

export class InvalidRootReceiptItemError extends Error {
  readonly _tag = "InvalidRootReceiptItemError";
}

export type GetRootFinancePositionsServiceInput = {
  accountAddresses: string[];
  stateVersion?: StateEntityDetailsInput["state"];
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

export class GetRootFinancePositionsService extends Context.Tag(
  "GetRootFinancePositionsService"
)<
  GetRootFinancePositionsService,
  (input: {
    accountAddresses: string[];
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<
    GetRootFinancePositionsServiceOutput,
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | ParseSborError
    | InvalidRootReceiptItemError,
    | GetNonFungibleBalanceService
    | GatewayApiClientService
    | EntityFungiblesPageService
    | GetLedgerStateService
    | EntityNonFungiblesPageService
  >
>() {}

type AccountAddress = string;
type ResourceAddress = string;
type Value = string;

export const GetRootFinancePositionsLive = Layer.effect(
  GetRootFinancePositionsService,
  Effect.gen(function* () {
    const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;

    const accountCollateralMap = new Map<
      AccountAddress,
      CollaterizedDebtPosition[]
    >();

    return (input) => {
      return Effect.gen(function* () {
        const result = yield* getNonFungibleBalanceService({
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
              resource.resourceAddress === RootFinance.receiptResourceAddress
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

              const collaterals = Object.fromEntries(
                collaterizedDebtPosition.collaterals.entries()
              ) as Record<ResourceAddress, Value>;

              const loans = Object.fromEntries(
                collaterizedDebtPosition.loans.entries()
              ) as Record<ResourceAddress, Value>;

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
      });
    };
  })
);

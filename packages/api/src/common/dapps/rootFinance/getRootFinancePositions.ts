import { Context, Effect, Layer } from "effect";

import type { GatewayApiClientService } from "../../gateway/gatewayApiClient";
import type { LoggerService } from "../../logger/logger";
import type { EntityFungiblesPageService } from "../../gateway/entityFungiblesPage";
import type {
  GetStateVersionError,
  GetStateVersionService,
} from "../../gateway/getStateVersion";
import type { GatewayError } from "../../gateway/errors";
import {
  type EntityNotFoundError,
  type GetEntityDetailsError,
  GetNonFungibleBalanceService,
  type InvalidInputError,
  type StateEntityDetailsInput,
} from "../../gateway/getNonFungibleBalance";
import type { EntityNonFungiblesPageService } from "../../gateway/entityNonFungiblesPage";
import { RootFinance } from "./constants";

import { CollaterizedDebtPositionData } from "./schema";
import type { SborError } from "@calamari-radix/sbor-ez-mode";

class ParseSborError {
  readonly _tag = "ParseSborError";
  constructor(readonly error: SborError) {}
}

class InvalidRootReceiptItemError extends Error {
  readonly _tag = "InvalidRootReceiptItemError";
}

export type GetRootFinancePositionsServiceInput = {
  accountAddresses: string[];
  stateVersion?: StateEntityDetailsInput["state"];
};

type CollaterizedDebtPosition = {
  nft: {
    resourceAddress: ResourceAddress;
    localId: string;
  };
  collaterals: Record<ResourceAddress, Value>;
  loans: Record<ResourceAddress, Value>;
};

export type GetRootFinancePositionsServiceOutput = {
  stateVersion: number;
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
    stateVersion?: StateEntityDetailsInput["state"];
  }) => Effect.Effect<
    GetRootFinancePositionsServiceOutput,
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | GetStateVersionError
    | ParseSborError
    | InvalidRootReceiptItemError,
    | GetNonFungibleBalanceService
    | GatewayApiClientService
    | LoggerService
    | EntityFungiblesPageService
    | GetStateVersionService
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
          state: input.stateVersion,
          options: {
            non_fungible_include_nfids: true,
          },
        });

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
          stateVersion: result.stateVersion,
          items,
        };
      });
    };
  })
);

import { Context, Effect, Layer } from "effect";

import type { GatewayApiClientService } from "../gateway/gatewayApiClient";
import type { LoggerService } from "../logger/logger";
import type { EntityFungiblesPageService } from "../gateway/entityFungiblesPage";
import type {
  GetStateVersionError,
  GetStateVersionService,
} from "../gateway/getStateVersion";
import type { GatewayError } from "../gateway/errors";
import {
  type EntityNotFoundError,
  type GetEntityDetailsError,
  GetNonFungibleBalanceService,
  type InvalidInputError,
  type StateEntityDetailsInput,
} from "../gateway/getNonFungibleBalance";
import type { EntityNonFungiblesPageService } from "../gateway/entityNonFungiblesPage";

export class GetRootFinancePositionsService extends Context.Tag(
  "GetRootFinancePositionsService"
)<
  GetRootFinancePositionsService,
  (input: {
    accountAddresses: string[];
    stateVersion?: StateEntityDetailsInput["state"];
  }) => Effect.Effect<
    { positions: Map<AccountAddress, Map<ResourceAddress, Value>> },
    | GetEntityDetailsError
    | EntityNotFoundError
    | InvalidInputError
    | GatewayError
    | GetStateVersionError,
    | GetNonFungibleBalanceService
    | GatewayApiClientService
    | LoggerService
    | EntityFungiblesPageService
    | GetStateVersionService
    | EntityNonFungiblesPageService
  >
>() {}

const RootReceiptResourceAddress =
  "resource_rdx1ngekvyag42r0xkhy2ds08fcl7f2ncgc0g74yg6wpeeyc4vtj03sa9f";

type AccountAddress = string;
type ResourceAddress = string;
type Value = string;

export const GetRootFinancePositionsLive = Layer.effect(
  GetRootFinancePositionsService,
  Effect.gen(function* () {
    const getNonFungibleBalanceService = yield* GetNonFungibleBalanceService;

    const accountCollateralMap = new Map<
      AccountAddress,
      Map<ResourceAddress, Value>
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
          const collateralMap = new Map<ResourceAddress, Value>();

          const rootReceipts = account.nonFungibleResources.filter(
            (resource) =>
              resource.resourceAddress === RootReceiptResourceAddress
          );

          for (const rootReceipt of rootReceipts) {
            const rootReceiptItems = rootReceipt.items;

            for (const rootReceiptItem of rootReceiptItems) {
              const rootReceiptItemSbor = rootReceiptItem.sbor;

              if (rootReceiptItemSbor?.kind === "Tuple") {
                const collateralField = rootReceiptItemSbor?.fields.find(
                  (field) => field.field_name === "collaterals"
                );

                if (collateralField?.kind === "Map") {
                  for (const { key, value } of collateralField.entries) {
                    if (
                      key.kind === "Reference" &&
                      value.kind === "PreciseDecimal"
                    ) {
                      collateralMap.set(key.value, value.value);
                    }
                  }
                }
              }
            }
          }

          accountCollateralMap.set(account.address, collateralMap);
        }

        return {
          positions: accountCollateralMap,
          stateVersion: result.stateVersion,
        };
      });
    };
  })
);

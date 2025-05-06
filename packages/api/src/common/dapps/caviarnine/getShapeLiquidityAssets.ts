import { Context, Effect, Layer } from "effect";
import {
  type PreviewTransactionInput,
  PreviewTransactionService,
} from "../../core/previewTransaction";
import type {
  CoreApiClientService,
  CoreNodeError,
  MissingBasicAuthError,
} from "../../core/coreApiClient";
import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import type { TransactionPreviewResponse } from "@radixdlt/babylon-core-api-sdk";
import { BigNumber } from "bignumber.js";

export class TransactionOutputNotFoundError {
  readonly _tag = "TransactionOutputNotFoundError";
}

export class TransactionPreviewError {
  readonly _tag = "TransactionPreviewError";
  constructor(readonly error: TransactionPreviewResponse) {}
}

export class InvalidTransactionOutputError {
  readonly _tag = "InvalidTransactionOutputError";
  constructor(readonly error: unknown) {}
}

export class InvalidNetworkError {
  readonly _tag = "InvalidNetworkError";
}

export class GetShapeLiquidityAssetsService extends Context.Tag(
  "GetShapeLiquidityAssetsService"
)<
  GetShapeLiquidityAssetsService,
  (input: {
    componentAddress: string;
    nonFungibleLocalId: string;
    stateVersion?: PreviewTransactionInput["at_ledger_state"];
    networkId: number;
  }) => Effect.Effect<
    {
      x: BigNumber;
      y: BigNumber;
    },
    | TransactionOutputNotFoundError
    | CoreNodeError
    | MissingBasicAuthError
    | TransactionPreviewError
    | InvalidTransactionOutputError
    | InvalidNetworkError,
    PreviewTransactionService | CoreApiClientService
  >
>() {}

export const GetShapeLiquidityAssetsLive = Layer.effect(
  GetShapeLiquidityAssetsService,
  Effect.gen(function* () {
    const previewTransaction = yield* PreviewTransactionService;

    return (input) => {
      return Effect.gen(function* () {
        const manifest = `CALL_METHOD 
            Address("${input.componentAddress}") 
            "get_redemption_value"
            NonFungibleLocalId("${input.nonFungibleLocalId}")
        ;`;

        let network: PreviewTransactionInput["network"] | undefined;

        if (input.networkId === 1) {
          network = "mainnet";
        } else if (input.networkId === 2) {
          network = "stokenet";
        }

        if (!network) {
          return yield* Effect.fail(new InvalidNetworkError());
        }

        const result = yield* previewTransaction({
          network,
          manifest,
          at_ledger_state: input.stateVersion,
          flags: {
            use_free_credit: true,
            assume_all_signature_proofs: true,
            skip_epoch_check: true,
          },
        });

        if (result.receipt.status !== "Succeeded") {
          return yield* Effect.fail(new TransactionPreviewError(result));
        }

        const output = result.receipt?.output?.[0]
          ?.programmatic_json as ProgrammaticScryptoSborValue;

        if (!output || output.kind !== "Tuple") {
          return yield* Effect.fail(new TransactionOutputNotFoundError());
        }

        const [x, y] = output.fields;

        if (x.kind !== "Decimal" || y.kind !== "Decimal") {
          return yield* Effect.fail(
            new InvalidTransactionOutputError({ x, y })
          );
        }

        const xValue = new BigNumber(x.value);
        const yValue = new BigNumber(y.value);

        return { x: xValue, y: yValue };
      });
    };
  })
);

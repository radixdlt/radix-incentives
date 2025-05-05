import { Context, Effect, Layer } from "effect";
import {
  type PreviewTransactionInput,
  PreviewTransactionService,
} from "../core/previewTransaction";
import type {
  CoreApiClientService,
  CoreNodeError,
  MissingBasicAuthError,
} from "../core/coreApiClient";
import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";
import type { TransactionPreviewResponse } from "@radixdlt/babylon-core-api-sdk";
import { BigNumber } from "bignumber.js";

type ShapeLiquidityPool = {
  name: string;
  componentAddress: string;
  token_x: string;
  token_y: string;
  liquidity_receipt: string;
};

const caviarNineAddresses: { shapeLiquidityPools: ShapeLiquidityPool[] } = {
  shapeLiquidityPools: [
    {
      name: "LSULP/XRD",
      componentAddress:
        "component_rdx1crdhl7gel57erzgpdz3l3vr64scslq4z7vd0xgna6vh5fq5fnn9xas",
      token_x:
        "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf",
      token_y:
        "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
      liquidity_receipt:
        "resource_rdx1ntrysy2sncpj6t6shjlgsfr55dns9290e2zsy67fwwrp6mywsrrgsc",
    },
    {
      name: "xwBTC/XRD",
      componentAddress:
        "component_rdx1cpqj6t2q9unetgvsnfgcmep90fc9y99gzzd58tkslu2etq0r4xs6zm",
      token_x:
        "resource_rdx1t580qxc7upat7lww4l2c4jckacafjeudxj5wpjrrct0p3e82sq4y75",
      token_y:
        "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
      liquidity_receipt:
        "resource_rdx1nfdteayvxl6425jc5x5xa0p440h6r2mr48mgtj58szujr5cvgnfmn9",
    },
    {
      name: "XRD/xUSDC",
      componentAddress:
        "component_rdx1cr6lxkr83gzhmyg4uxg49wkug5s4wwc3c7cgmhxuczxraa09a97wcu",
      token_x:
        "resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
      token_y:
        "resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf",
      liquidity_receipt:
        "resource_rdx1ntzhjg985wgpkhda9f9q05xqdj8xuggfw0j5u3zxudk2csv82d0089",
    },
  ],
} as const;

export const shapeLiquidityReceiptSet = new Map<string, ShapeLiquidityPool>(
  caviarNineAddresses.shapeLiquidityPools.map((pool) => [
    pool.liquidity_receipt,
    pool,
  ])
);

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

export class GetShapeLiquidityAssetsService extends Context.Tag(
  "GetShapeLiquidityAssetsService"
)<
  GetShapeLiquidityAssetsService,
  (input: {
    componentAddress: string;
    nonFungibleLocalId: string;
    stateVersion?: PreviewTransactionInput["at_ledger_state"];
  }) => Effect.Effect<
    {
      x: BigNumber;
      y: BigNumber;
    },
    | TransactionOutputNotFoundError
    | CoreNodeError
    | MissingBasicAuthError
    | TransactionPreviewError
    | InvalidTransactionOutputError,
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

        const result = yield* previewTransaction({
          network: "mainnet",
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

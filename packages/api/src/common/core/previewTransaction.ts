import { Context, Effect, Layer } from "effect";

import {
  CoreApiClientService,
  CoreNodeError,
  type MissingBasicAuthError,
} from "./coreApiClient";
import type {
  CoreApiClient,
  TransactionPreviewResponse,
} from "@radixdlt/babylon-core-api-sdk";

export type PreviewTransactionInput = Parameters<
  CoreApiClient["transaction"]["innerClient"]["transactionPreviewPost"]
>[0]["transactionPreviewRequest"];

export class PreviewTransactionService extends Context.Tag(
  "PreviewTransactionService"
)<
  PreviewTransactionService,
  (
    input: PreviewTransactionInput
  ) => Effect.Effect<
    TransactionPreviewResponse,
    CoreNodeError | MissingBasicAuthError,
    CoreApiClientService
  >
>() {}

export const PreviewTransactionLive = Layer.effect(
  PreviewTransactionService,
  Effect.gen(function* () {
    const coreApiClientService = yield* CoreApiClientService;

    return (input) => {
      return Effect.gen(function* () {
        const client = yield* coreApiClientService();

        const result = yield* Effect.tryPromise({
          try: () =>
            client.transaction.innerClient.transactionPreviewPost({
              transactionPreviewRequest: input,
            }),
          catch: (error) => new CoreNodeError(error),
        });

        return result;
      });
    };
  })
);

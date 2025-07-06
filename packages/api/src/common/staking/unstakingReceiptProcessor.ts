import { Context, Effect, Layer } from "effect";
import { BigNumber } from "bignumber.js";
import { EntityNonFungibleDataService } from "../gateway/entityNonFungiblesData";
import { claimNftSchema } from "./schema";
import type { GatewayError } from "../gateway/errors";
import type { AtLedgerState } from "../gateway/schemas";
import type { ProgrammaticScryptoSborValue } from "@radixdlt/babylon-gateway-api-sdk";

export type UnstakingReceipt = {
  resourceAddress: string;
  id: string;
  claimAmount: BigNumber;
  claimEpoch: number;
  validatorAddress: string;
};

export class FailedToParseUnstakingReceiptError {
  readonly _tag = "FailedToParseUnstakingReceiptError";
  constructor(
    readonly nftId: string,
    readonly error: unknown
  ) {}
}

export class UnstakingReceiptProcessorService extends Context.Tag(
  "UnstakingReceiptProcessorService"
)<
  UnstakingReceiptProcessorService,
  (input: {
    unstakingReceiptRequests: Array<{
      resourceAddress: string;
      nftIds: string[];
      validatorAddress: string;
    }>;
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<
    UnstakingReceipt[],
    GatewayError | FailedToParseUnstakingReceiptError
  >
>() {}

const extractUnstakingReceiptData = (
  resourceAddress: string,
  nftIds: string[],
  validatorAddress: string,
  nftItems: Array<{
    id: string;
    data?: { programmatic_json?: ProgrammaticScryptoSborValue };
  }>
): Effect.Effect<
  UnstakingReceipt[],
  FailedToParseUnstakingReceiptError,
  never
> => {
  return Effect.gen(function* () {
    const results = yield* Effect.forEach(
      nftItems.filter((nft) => nftIds.includes(nft.id)),
      (nft) =>
        Effect.gen(function* () {
          const programmaticJson = nft.data?.programmatic_json;

          if (!programmaticJson) {
            return yield* Effect.fail(
              new FailedToParseUnstakingReceiptError(
                nft.id,
                "Missing programmatic_json data"
              )
            );
          }

          const sborData = claimNftSchema.safeParse(programmaticJson);

          if (sborData.isErr()) {
            return yield* Effect.fail(
              new FailedToParseUnstakingReceiptError(nft.id, sborData.error)
            );
          }

          return {
            resourceAddress,
            id: nft.id,
            claimAmount: new BigNumber(sborData.value.claim_amount),
            claimEpoch: sborData.value.claim_epoch,
            validatorAddress,
          };
        }),
      { concurrency: 10 }
    );

    return results;
  });
};

export const UnstakingReceiptProcessorLive = Layer.effect(
  UnstakingReceiptProcessorService,
  Effect.gen(function* () {
    const entityNonFungibleDataService = yield* EntityNonFungibleDataService;

    return (input) =>
      Effect.gen(function* () {
        const allUnstakingReceipts: UnstakingReceipt[] = [];

        for (const request of input.unstakingReceiptRequests) {
          if (request.nftIds.length === 0) continue;

          const specificNftData = yield* entityNonFungibleDataService({
            resource_address: request.resourceAddress,
            non_fungible_ids: request.nftIds,
            at_ledger_state: input.at_ledger_state,
          }).pipe(Effect.withSpan("fetchUnstakingReceiptNftData"));

          const relevantNftItems = specificNftData
            .filter((item) => request.nftIds.includes(item.non_fungible_id))
            .map((item) => ({
              id: item.non_fungible_id,
              data: item.data,
            }));

          const receipts = yield* extractUnstakingReceiptData(
            request.resourceAddress,
            request.nftIds,
            request.validatorAddress,
            relevantNftItems
          );

          allUnstakingReceipts.push(...receipts);
        }

        return allUnstakingReceipts;
      });
  })
);

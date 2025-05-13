import { Context, Effect, Layer } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import { GatewayError } from "./errors";
import type { StateEntityDetailsInput } from "./getFungibleBalance";
import type { LedgerState } from "@radixdlt/babylon-gateway-api-sdk";

export class GetLedgerStateService extends Context.Tag("GetLedgerStateService")<
  GetLedgerStateService,
  (
    input: StateEntityDetailsInput["state"]
  ) => Effect.Effect<LedgerState, GatewayError, GatewayApiClientService>
>() {}

export const GetLedgerStateLive = Layer.effect(
  GetLedgerStateService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input) => {
      return Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            gatewayClient.gatewayApiClient.stream.innerClient.streamTransactions(
              {
                streamTransactionsRequest: {
                  limit_per_page: 1,
                  at_ledger_state: input,
                },
              }
            ),
          catch: (error) => new GatewayError(error),
        });

        return result.ledger_state;
      });
    };
  })
);

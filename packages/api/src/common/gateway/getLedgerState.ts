import { Context, Effect, Layer } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import { GatewayError } from "./errors";

import type { LedgerState } from "@radixdlt/babylon-gateway-api-sdk";
import type { AtLedgerState } from "./schemas";

export type GetLedgerStateInput = {
  at_ledger_state: AtLedgerState;
};

export class GetLedgerStateService extends Context.Tag("GetLedgerStateService")<
  GetLedgerStateService,
  (input: {
    at_ledger_state: AtLedgerState;
  }) => Effect.Effect<LedgerState, GatewayError, GatewayApiClientService>
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
                  at_ledger_state: input.at_ledger_state,
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

export const getLedgerStateProgram = (input: GetLedgerStateInput) =>
  Effect.gen(function* () {
    const getLedgerState = yield* GetLedgerStateService;
    return yield* getLedgerState(input);
  });

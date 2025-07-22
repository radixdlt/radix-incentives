import { Effect } from "effect";
import { GatewayApiClientService } from "../gateway/gatewayApiClient";
import type { AtLedgerState } from "./schemas";
import { GatewayError } from "./errors";

type GetEntityDetailsParameters = Parameters<
  GatewayApiClientService["state"]["getEntityDetailsVaultAggregated"]
>;

export type GetEntityDetailsInput = GetEntityDetailsParameters[0];
export type GetEntityDetailsOptions = GetEntityDetailsParameters[1];
export type GetEntityDetailsState = GetEntityDetailsParameters[2];

export class GetEntityDetailsService extends Effect.Service<GetEntityDetailsService>()(
  "GetEntityDetailsService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      return Effect.fn(function* (
        input: GetEntityDetailsInput,
        options: GetEntityDetailsOptions,
        at_ledger_state: AtLedgerState
      ) {
        return yield* Effect.tryPromise({
          try: () =>
            gatewayClient.state.getEntityDetailsVaultAggregated(
              input,
              options,
              at_ledger_state
            ),
          catch: (error) => new GatewayError({ error }),
        });
      });
    }),
  }
) {}

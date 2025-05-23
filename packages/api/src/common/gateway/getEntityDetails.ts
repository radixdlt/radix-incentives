import { Context, Effect, Layer } from "effect";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "../gateway/gatewayApiClient";
import type { AtLedgerState } from "./schemas";

export class GetEntityDetailsError {
  readonly _tag = "GetEntityDetailsError";
  constructor(readonly error: unknown) {}
}

export type GetEntityDetailsParameters = Parameters<
  GatewayApiClientImpl["gatewayApiClient"]["state"]["getEntityDetailsVaultAggregated"]
>;

export type GetEntityDetailsInput = GetEntityDetailsParameters[0];
export type GetEntityDetailsOptions = GetEntityDetailsParameters[1];
export type GetEntityDetailsState = GetEntityDetailsParameters[2];
type GetEntityDetailsResult = Awaited<
  ReturnType<
    GatewayApiClientImpl["gatewayApiClient"]["state"]["getEntityDetailsVaultAggregated"]
  >
>;

export class GetEntityDetailsService extends Context.Tag(
  "GetEntityDetailsService"
)<
  GetEntityDetailsService,
  (
    input: GetEntityDetailsInput,
    options: GetEntityDetailsOptions,
    at_ledger_state: AtLedgerState
  ) => Effect.Effect<GetEntityDetailsResult, GetEntityDetailsError, never>
>() {}

export const GetEntityDetailsServiceLive = Layer.effect(
  GetEntityDetailsService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return (input, options, state) => {
      return Effect.gen(function* () {
        return yield* Effect.tryPromise({
          try: () =>
            gatewayClient.gatewayApiClient.state.getEntityDetailsVaultAggregated(
              input,
              options,
              state
            ),
          catch: (error) => {
            return new GetEntityDetailsError(error);
          },
        });
      });
    };
  })
);

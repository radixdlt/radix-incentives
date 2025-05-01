import { Context, Effect, Layer } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import { GatewayError } from "./errors";

export class GetStateVersionError {
  readonly _tag = "GetStateVersionError";
  constructor(readonly error: unknown) {}
}

export class GetStateVersionService extends Context.Tag(
  "GetStateVersionService"
)<
  GetStateVersionService,
  (
    input: Date
  ) => Effect.Effect<
    { stateVersion: number; confirmedAt: Date },
    GatewayError | GetStateVersionError,
    GatewayApiClientService
  >
>() {}

export const GetStateVersionLive = Layer.effect(
  GetStateVersionService,
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
                  at_ledger_state: {
                    timestamp: input,
                  },
                },
              }
            ),
          catch: (error) => {
            return new GatewayError(error);
          },
        });

        if (!result.items[0].confirmed_at) {
          return yield* Effect.fail(
            new GetStateVersionError("No state version found")
          );
        }

        const stateVersion = result.items[0].state_version;
        const confirmedAt = result.items[0].confirmed_at;

        return { stateVersion, confirmedAt };
      });
    };
  })
);

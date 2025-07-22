import { Config, Effect } from "effect";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import fetchRetry from "fetch-retry";

export class GatewayApiClientService extends Effect.Service<GatewayApiClientService>()(
  "GatewayApiClientService",
  {
    effect: Effect.gen(function* () {
      const networkId = yield* Config.number("NETWORK_ID").pipe(
        Config.withDefault(1)
      );
      const basePath = yield* Config.string("GATEWAY_URL").pipe(
        Config.withDefault(undefined)
      );
      const applicationName = yield* Config.string("APPLICATION_NAME").pipe(
        Config.withDefault("radix-web3.js")
      );
      const gatewayApiKey = yield* Config.string("GATEWAY_BASIC_AUTH").pipe(
        Config.withDefault(undefined)
      );

      /**
       * Enable retries for ALL requests including POST
       * - Retry on network errors and 4xx/5xx status codes
       * - Uses exponential backoff with randomization
       * - Supports retrying POST requests (unlike make-fetch-happen)
       */
      const fetchImpl = fetchRetry(globalThis.fetch, {
        retries: 3,
        retryDelay: (attempt, error, response) => {
          return 2 ** attempt * 1000; // 1000, 2000, 4000ms
        },
        retryOn: (attempt, error, response) => {
          // Retry on network errors
          if (error !== null) {
            return true;
          }
          // Retry on 4xx/5xx status codes (including for POST requests)
          if (response && response.status >= 400) {
            return true;
          }
          return false;
        },
      }) as unknown as (typeof globalThis)["fetch"];

      const client = GatewayApiClient.initialize({
        networkId,
        basePath,
        applicationName,
        headers: gatewayApiKey
          ? { Authorization: `Basic ${gatewayApiKey}` }
          : undefined,
        fetchApi: fetchImpl,
      });

      return client;
    }),
  }
) {}

export const GatewayApiClientLive = GatewayApiClientService.Default;

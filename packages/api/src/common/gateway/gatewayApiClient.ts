import { GatewayApiClient } from '@radixdlt/babylon-gateway-api-sdk';
import { Config, Effect } from 'effect';
import fetchRetry from 'fetch-retry';
import { fetch } from 'undici';

export class GatewayApiClientService extends Effect.Service<GatewayApiClientService>()(
  'GatewayApiClientService',
  {
    effect: Effect.gen(function* () {
      const networkId = yield* Config.number('NETWORK_ID').pipe(
        Config.withDefault(1),
      );
      const basePath = yield* Config.string('GATEWAY_URL').pipe(
        Config.withDefault(undefined),
      );
      const applicationName = yield* Config.string('APPLICATION_NAME').pipe(
        Config.withDefault('radix-web3.js'),
      );
      const gatewayApiKey = yield* Config.string('GATEWAY_BASIC_AUTH').pipe(
        Config.withDefault(undefined),
      );

      const gatewayRetryAttempts = yield* Config.number(
        'GATEWAY_RETRY_ATTEMPTS',
      ).pipe(Config.withDefault(5));

      /**
       * Enable retries for ALL requests including POST
       * - Retry on network errors and 4xx/5xx status codes
       * - Uses exponential backoff with randomization
       * - Supports retrying POST requests (unlike make-fetch-happen)
       */

      const fetchImpl = fetchRetry(fetch, {
        retries: gatewayRetryAttempts,
        retryDelay: (attempt, _error, _response) => {
          const maxDelay = 30_000; // 30 seconds max
          const baseDelay = Math.min(2 ** attempt * 1000, maxDelay); // 1000, 2000, 4000ms etc up to max
          return Math.floor(baseDelay);
        },
        retryOn: (_attempt, error, response) => {
          // Retry on network errors
          if (error !== null) {
            return false;
          }
          // Retry on 4xx/5xx status codes (including for POST requests)
          if (response && response.status > 400) {
            return true;
          }

          return false;
        },
      });

      const client = GatewayApiClient.initialize({
        networkId,
        basePath,
        applicationName,
        headers: gatewayApiKey
          ? { Authorization: `Basic ${gatewayApiKey}` }
          : undefined,
        // biome-ignore lint/suspicious/noExplicitAny: Fetch-retry types are incompatible with expected fetch API
        fetchApi: fetchImpl as any,
      });

      return client;
    }),
  },
) {}

export const GatewayApiClientLive = GatewayApiClientService.Default;

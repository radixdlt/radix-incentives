import { GatewayApiClient } from '@radixdlt/babylon-gateway-api-sdk';
import { Config, Data, Effect } from 'effect';
import fetchRetry from 'fetch-retry';
import { fetch } from 'undici';

export class GatewayError extends Data.TaggedError('GatewayError')<{
  error: unknown;
}> {}

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

      const noRetryStatusCodes = new Set([400, 404]);

      const fetchImpl = fetchRetry(fetch, {
        retries: gatewayRetryAttempts,
        retryDelay: (attempt, _error, _response) => {
          const maxDelay = 30_000; // 30 seconds max
          const baseDelay = Math.min(2 ** attempt * 1000, maxDelay); // 1000, 2000, 4000ms etc up to max
          return Math.floor(baseDelay);
        },
        retryOn: (attempt, error, response) => {
          if (attempt > gatewayRetryAttempts) {
            return false;
          }

          // Retry on network errors
          if (error !== null) {
            return false;
          }

          // Retry on 4xx/5xx status codes (including for POST requests)
          if (response && !response.ok) {
            if (noRetryStatusCodes.has(response.status)) return false;

            return true;
          }

          return false;
        },
      });

      const gatewayApiClient = GatewayApiClient.initialize({
        networkId,
        basePath,
        applicationName,
        headers: gatewayApiKey
          ? { Authorization: `Basic ${gatewayApiKey}` }
          : undefined,
        // biome-ignore lint/suspicious/noExplicitAny: Fetch-retry types are incompatible with expected fetch API
        fetchApi: fetchImpl as any,
      });

      // Wrapper methods that return Effect instances
      const wrapMethod = <TArgs extends unknown[], TResult>(
        fn: (...args: TArgs) => Promise<TResult>,
      ) => {
        return (...args: TArgs) =>
          Effect.tryPromise({
            try: () => fn(...args),
            catch: (error) => new GatewayError({ error }),
          });
      };

      return {
        // State API methods
        state: {
          getEntityDetailsVaultAggregated: wrapMethod(
            gatewayApiClient.state.getEntityDetailsVaultAggregated.bind(
              gatewayApiClient.state,
            ),
          ),
          getValidators: wrapMethod(
            gatewayApiClient.state.getValidators.bind(gatewayApiClient.state),
          ),
          // InnerClient state methods
          innerClient: {
            stateEntityDetails: wrapMethod(
              gatewayApiClient.state.innerClient.stateEntityDetails.bind(
                gatewayApiClient.state.innerClient,
              ),
            ),
            entityFungiblesPage: wrapMethod(
              gatewayApiClient.state.innerClient.entityFungiblesPage.bind(
                gatewayApiClient.state.innerClient,
              ),
            ),
            entityNonFungiblesPage: wrapMethod(
              gatewayApiClient.state.innerClient.entityNonFungiblesPage.bind(
                gatewayApiClient.state.innerClient,
              ),
            ),
            entityNonFungibleIdsPage: wrapMethod(
              gatewayApiClient.state.innerClient.entityNonFungibleIdsPage.bind(
                gatewayApiClient.state.innerClient,
              ),
            ),
            entityNonFungibleResourceVaultPage: wrapMethod(
              gatewayApiClient.state.innerClient.entityNonFungibleResourceVaultPage.bind(
                gatewayApiClient.state.innerClient,
              ),
            ),
            keyValueStoreKeys: wrapMethod(
              gatewayApiClient.state.innerClient.keyValueStoreKeys.bind(
                gatewayApiClient.state.innerClient,
              ),
            ),
            keyValueStoreData: wrapMethod(
              gatewayApiClient.state.innerClient.keyValueStoreData.bind(
                gatewayApiClient.state.innerClient,
              ),
            ),
            nonFungibleData: wrapMethod(
              gatewayApiClient.state.innerClient.nonFungibleData.bind(
                gatewayApiClient.state.innerClient,
              ),
            ),
            nonFungibleLocation: wrapMethod(
              gatewayApiClient.state.innerClient.nonFungibleLocation.bind(
                gatewayApiClient.state.innerClient,
              ),
            ),
            nonFungibleIds: wrapMethod(
              gatewayApiClient.state.innerClient.nonFungibleIds.bind(
                gatewayApiClient.state.innerClient,
              ),
            ),
          },
        },
        // Stream API methods
        stream: {
          innerClient: {
            streamTransactions: wrapMethod(
              gatewayApiClient.stream.innerClient.streamTransactions.bind(
                gatewayApiClient.stream.innerClient,
              ),
            ),
          },
        },
        // Transaction API methods
        transaction: {
          getCommittedDetails: wrapMethod(
            gatewayApiClient.transaction.getCommittedDetails.bind(
              gatewayApiClient.transaction,
            ),
          ),
          innerClient: {
            transactionSubmit: wrapMethod(
              gatewayApiClient.transaction.innerClient.transactionSubmit.bind(
                gatewayApiClient.transaction.innerClient,
              ),
            ),
            transactionStatus: wrapMethod(
              gatewayApiClient.transaction.innerClient.transactionStatus.bind(
                gatewayApiClient.transaction.innerClient,
              ),
            ),
          },
        },
        // Status API methods
        status: {
          getCurrent: wrapMethod(
            gatewayApiClient.status.getCurrent.bind(gatewayApiClient.status),
          ),
          innerClient: {
            gatewayStatus: wrapMethod(
              gatewayApiClient.status.innerClient.gatewayStatus.bind(
                gatewayApiClient.status.innerClient,
              ),
            ),
          },
        },
        // Extensions API methods
        extensions: {
          getResourceHolders: wrapMethod(
            gatewayApiClient.extensions.getResourceHolders.bind(
              gatewayApiClient.extensions,
            ),
          ),
          innerClient: {
            entitiesByRoleRequirementLookup: wrapMethod(
              gatewayApiClient.extensions.innerClient.entitiesByRoleRequirementLookup.bind(
                gatewayApiClient.extensions.innerClient,
              ),
            ),
          },
        },
        // Get raw client for any methods not wrapped
        rawClient: gatewayApiClient,
      };
    }),
  },
) {}

export const GatewayApiClientLive = GatewayApiClientService.Default;

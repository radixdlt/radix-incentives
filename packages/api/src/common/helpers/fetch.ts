import { Effect } from 'effect';
import fetchRetry from 'fetch-retry';
import { fetch } from 'undici';

export class FetchService extends Effect.Service<FetchService>()(
  'FetchService',
  {
    effect: Effect.gen(function* () {
      const fetchImpl = fetchRetry(fetch, {
        retries: 3,
        retryOn: (_, error, __) => {
          // Retry on network errors
          if (error !== null) {
            return true;
          }

          return false;
        },
      });

      return fetchImpl;
    }),
  },
) {}

import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import SuperJSON from 'superjson';
import { api } from './react';

export const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
        // Keep data in cache for longer to improve switching between tabs
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });

  // Set query defaults for specific user queries with longer cache times
  queryClient.setQueryDefaults(
    [
      getQueryKey(api.user.getUserCapitalAtWork),
      getQueryKey(api.user.getMultiplierByUserId),
      getQueryKey(api.user.getUserCategoryBreakdown),
    ],
    {
      staleTime: 10 * 60 * 1000,
    },
  );

  return queryClient;
};

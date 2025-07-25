import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

const getStaleTimeForQuery = (queryKey: unknown[]): number => {
  // Check if this is a tRPC query key structure: [["leaderboard", "method"], input]
  const trpcKey = queryKey[0];
  if (Array.isArray(trpcKey) && trpcKey[0] === "leaderboard") {
    const method = trpcKey[1];

    if (
      method === "getAvailableSeasons" ||
      method === "getAvailableWeeks" ||
      method === "getAvailableCategories"
    ) {
      return 5 * 60 * 1000; // 5 minutes
    }

    if (
      method === "getSeasonLeaderboard" ||
      method === "getActivityCategoryLeaderboard"
    ) {
      return 2 * 60 * 1000; // 2 minutes
    }
  }

  // Default stale time for other queries
  return 30 * 1000; // 30 seconds
};

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
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });

  // Override the getOptions method to provide custom stale times
  const originalGetQueryDefaults =
    queryClient.getQueryDefaults.bind(queryClient);
  queryClient.getQueryDefaults = (queryKey) => {
    const defaults = originalGetQueryDefaults(queryKey);
    return {
      ...defaults,
      staleTime: getStaleTimeForQuery([...(queryKey ?? [])]),
    };
  };

  return queryClient;
};

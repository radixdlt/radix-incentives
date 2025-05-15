import {
  GatewayApiClient,
  RadixNetwork,
  type StateKeyValueStoreDataRequestKeyItem,
  type LedgerStateSelector,
  type StateKeyValueStoreDataResponse,
  type StateKeyValueStoreKeysResponse,
  type StateKeyValueStoreKeysResponseItem,
  type StateEntityDetailsResponseItem,
  type StateEntityDetailsOptions,
  type StateKeyValueStoreDataResponseItem,
  type StateNonFungibleDetailsResponseItem,
} from "@radixdlt/babylon-gateway-api-sdk";

// C9 contracts only exist on Mainnet
const NETWORK = RadixNetwork.Mainnet;

// Helper function to break an array into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  if (chunkSize <= 0) {
    throw new Error("Chunk size must be greater than 0.");
  }
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Initializes and returns a Gateway API client instance.
export const getGatewayApi = () => {
  return GatewayApiClient.initialize({
    applicationName: "Radix Liquidity Calculator Lib",
    networkId: NETWORK,
  });
};

export type GatewayApi = ReturnType<typeof GatewayApiClient.initialize>;

/**
 * Fetches Key-Value Store data in chunks, accepting StateKeyValueStoreKeysResponseItem[] as input.
 *
 * @param keyValureStoreAddress - The component address of the key-value store.
 * @param keysToFetch - An array of StateKeyValueStoreKeysResponseItem (output from getAllKeyValueStoreKeys).
 * @param gatewayApi - The initialized Gateway API client.
 * @param ledgerState - The specific state version to query against (optional).
 * @param chunkSize - The number of keys to fetch in each chunk.
 * @returns A promise that resolves to an array of key-value store data items.
 */

export const fetchKeyValueStoreDataInChunks = async (
  keyValureStoreAddress: string,
  keysToFetch: StateKeyValueStoreKeysResponseItem[],
  gatewayApi: GatewayApi,
  ledgerState?: LedgerStateSelector,
  chunkSize = 100
): Promise<StateKeyValueStoreDataResponseItem[]> => {
  // Map StateKeyValueStoreKeysResponseItem to StateKeyValueStoreDataRequestKeyItem
  const sdkRequestKeys: StateKeyValueStoreDataRequestKeyItem[] =
    keysToFetch.map((keyItem) => ({
      key_hex: keyItem.key.raw_hex,
    }));

  const chunks = chunkArray<StateKeyValueStoreDataRequestKeyItem>(
    sdkRequestKeys,
    chunkSize
  );

  const chunkPromises = chunks.map((chunk) =>
    gatewayApi.state.innerClient.keyValueStoreData({
      stateKeyValueStoreDataRequest: {
        key_value_store_address: keyValureStoreAddress,
        keys: chunk,
        at_ledger_state: ledgerState,
      },
    })
  );

  const chunkResponses = await Promise.all(chunkPromises);
  const allEntries = chunkResponses.flatMap(
    (response: StateKeyValueStoreDataResponse) => response.entries
  );

  return allEntries;
};

/**
 * Fetches all keys from a Key-Value Store, handling pagination.
 *
 * @param api - The initialized Gateway API client.
 * @param keyValueStoreAddress - The component address of the key-value store.
 * @param ledgerState - The specific state version to query against (optional).
 * @returns A promise that resolves to an array of StateKeyValueStoreKeysResponseItem.
 */
export const getAllKeyValueStoreKeys = async (
  api: GatewayApi,
  keyValueStoreAddress: string,
  ledgerState?: LedgerStateSelector
): Promise<StateKeyValueStoreKeysResponseItem[]> => {
  let allKeys: StateKeyValueStoreKeysResponseItem[] = [];
  let currentCursor: string | undefined = undefined;
  let hasMore = true;

  // Keys retrieval in progress

  while (hasMore) {
    const response: StateKeyValueStoreKeysResponse =
      await api.state.innerClient.keyValueStoreKeys({
        stateKeyValueStoreKeysRequest: {
          key_value_store_address: keyValueStoreAddress,
          at_ledger_state: ledgerState,
          cursor: currentCursor,
          limit_per_page: 100,
        },
      });

    if (response.items && response.items.length > 0) {
      allKeys = allKeys.concat(response.items);
    }

    if (response.next_cursor) {
      currentCursor = response.next_cursor;
    } else {
      hasMore = false;
    }
  }
  return allKeys;
};

/**
 * Fetches Non-Fungible Token (NFT) data.
 *
 * @param api - The initialized Gateway API client.
 * @param nftAddress - The resource address of the NFT.
 * @param nftId - The ID of the NFT.
 * @param stateVersion - The specific state version to query against (optional).
 * @returns A promise that resolves to the NFT data.
 */
export const getNFTData = async (
  api: GatewayApi,
  nftAddress: string,
  nftId: string,
  stateVersion?: number
): Promise<StateNonFungibleDetailsResponseItem[]> => {
  const ledgerStateSelector = stateVersion
    ? { state_version: stateVersion }
    : undefined;
  const nftDataResponse = await api.state.getNonFungibleData(
    nftAddress,
    [nftId],
    ledgerStateSelector
  );
  return nftDataResponse;
};

/**
 * Fetches NFT data in chunks to avoid rate limiting
 * @param nftIds Array of NFT IDs to fetch
 * @param nftAddress The NFT resource address
 * @param api Gateway API client
 * @param stateVersion Optional state version
 * @param chunkSize Maximum number of NFTs to fetch in one request
 * @returns A record mapping NFT IDs to their data
 */
export const getNFTDataInChunks = async (
  nftIds: string[],
  nftAddress: string,
  api: GatewayApi,
  stateVersion?: number,
  chunkSize = 100
): Promise<Record<string, object>> => {
  const chunks = chunkArray(nftIds, chunkSize);
  const allNftData: Record<string, object> = {};

  for (const chunk of chunks) {
    const chunkPromises = chunk.map((nftId) =>
      getNFTData(api, nftAddress, nftId, stateVersion)
        .then((data) => ({ nftId, data: data?.[0]?.data?.programmatic_json }))
        .catch((error) => {
          // Error fetching NFT data, returning null for this NFT
          return { nftId, data: null };
        })
    );

    const chunkResults = await Promise.all(chunkPromises);

    chunkResults.forEach(({ nftId, data }) => {
      if (data) {
        allNftData[nftId] = data;
      }
    });

    // Add delay between chunks to avoid rate limiting
    if (chunks.indexOf(chunk) < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return allNftData;
};

/**
 * Fetches detailed data for a component using getEntityDetailsVaultAggregated.
 *
 * @param api - The initialized Gateway API client.
 * @param componentAddress - The address of the component.
 * @param stateVersion - The specific state version to query against (optional).
 * @returns A promise that resolves to the component data, or null if not found.
 */
export const getComponentData = async (
  api: GatewayApi,
  componentAddress: string,
  stateVersion?: number
): Promise<StateEntityDetailsResponseItem | null> => {
  const ledgerState = stateVersion
    ? { state_version: stateVersion }
    : undefined;
  const options: StateEntityDetailsOptions = {};

  try {
    const responseItems = await api.state.getEntityDetailsVaultAggregated(
      [componentAddress],
      options,
      ledgerState
    );

    if (responseItems && responseItems.length > 0) {
      return responseItems[0];
    } else {
      // No component data found
      return null;
    }
  } catch (error) {
    // Error with API call, propagate error
    throw error;
  }
};

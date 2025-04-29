import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";

const gatewayApiClient = GatewayApiClient.initialize({
  networkId: 1,
  applicationName: "stateversion",
  applicationVersion: "1.0.0",
});

const START_DATE = new Date("2025-04-14T00:00:00Z");
const END_DATE = new Date("2025-04-20T23:59:59Z");

const getStateVersion = async (date: Date) => {
  return await gatewayApiClient.stream.innerClient
    .streamTransactions({
      streamTransactionsRequest: {
        limit_per_page: 1,
        at_ledger_state: {
          timestamp: date,
        },
      },
    })
    .then((result) => ({
      stateVersion: result.items[0].state_version,
      confirmed_at: result.items[0].confirmed_at,
    }));
};

const main = async () => {
  const stateVersion = await getStateVersion(START_DATE);
  const endStateVersion = await getStateVersion(END_DATE);

  console.log([stateVersion, endStateVersion]);
};

main();

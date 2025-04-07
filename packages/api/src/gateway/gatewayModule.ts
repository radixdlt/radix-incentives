import {
  GatewayApiClient,
  RadixNetwork,
} from '@radixdlt/babylon-gateway-api-sdk';

import { gatewayClientImplementation } from './gatewayClientImplementation';

// TODO: Use `exhaustPaginationWithLedgerState` to get all events for a component

export type GatewayModule = ReturnType<typeof GatewayModule>;
export const GatewayModule = ({
  gatewayClient,
  stokenetGatewayClient,
}: {
  gatewayClient?: GatewayApiClient;
  stokenetGatewayClient?: GatewayApiClient;
}) => {
  const gateway =
    gatewayClient ??
    GatewayApiClient.initialize({
      networkId: RadixNetwork.Mainnet,
      applicationName: 'hookah.ing',
      applicationVersion: '0.0.1',
    });

  const stokenetGateway =
    stokenetGatewayClient ??
    GatewayApiClient.initialize({
      networkId: RadixNetwork.Stokenet,
      applicationName: 'hookah.ing',
      applicationVersion: '0.0.1',
    });

  const stokenet = gatewayClientImplementation(stokenetGateway);

  const mainnet = gatewayClientImplementation(gateway);

  const networkAwareGatewayClient = (address: string) =>
    address.includes('_tdx_2_') ? stokenet : mainnet;

  return {
    stateEntityDetails: (address: string) =>
      networkAwareGatewayClient(address).stateEntityDetails(address),
    getAllEventsForComponent: (address: string) =>
      networkAwareGatewayClient(address).getAllEventsForComponent(address),
  };
};

export const gatewayModule = GatewayModule({});

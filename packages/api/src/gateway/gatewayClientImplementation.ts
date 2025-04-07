import type { BlueprintInterface } from "@radixdlt/babylon-core-api-sdk";
import type { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";

export const gatewayClientImplementation = (gateway: GatewayApiClient) => {
  const getComponentInformation = async (
    address: string
  ): Promise<{ packageAddress: string; blueprintName: string } | null> => {
    const { items } = await gateway.state.innerClient.stateEntityDetails({
      stateEntityDetailsRequest: {
        addresses: [address],
      },
    });

    if (!items?.[0]?.details) {
      return null;
    }

    const packageDetails = items[0].details as {
      package_address?: string;
      blueprint_name?: string;
    };

    if (packageDetails?.package_address && packageDetails?.blueprint_name) {
      return {
        packageAddress: packageDetails.package_address,
        blueprintName: packageDetails.blueprint_name,
      };
    }

    return null;
  };

  const getAllEventsForComponent = async (
    address: string
  ): Promise<{
    interface: BlueprintInterface;
  } | null> => {
    const information = await getComponentInformation(address);

    if (!information) {
      return null;
    }

    // Todo: Use `exhaustPaginationWithLedgerState` to get all data
    const events = await gateway.state.innerClient.packageBlueprintPage({
      statePackageBlueprintPageRequest: {
        package_address: information.packageAddress,
      },
    });

    return events.items.find((item) => item.name === information.blueprintName)
      ?.definition as {
      interface: BlueprintInterface;
    };
  };

  const stateEntityDetails = async (address: string) => {
    const entityData = await gateway.state.innerClient.stateEntityDetails({
      stateEntityDetailsRequest: {
        addresses: [address],
      },
    });

    return entityData.items[0];
  };
  return {
    getComponentInformation,
    getAllEventsForComponent,
    stateEntityDetails,
  };
};

import type { TransformedEvent } from "../../transaction-stream";
import {
  DepositFungibleEventSchema,
  DepositNonFungibleEventSchema,
} from "./schemas";

export const parseDepositEvent = (
  input: TransformedEvent,
  options: {
    isWhiteListedResourceAddress: (resourceAddress: string) => boolean;
  }
) => {
  if (input?.event.name === "DepositEvent") {
    const result = DepositNonFungibleEventSchema.safeParse(
      input?.event.payload
    );

    if (result.isOk()) {
      const [resourceAddress, nftIds] = result.value.value;

      if (options.isWhiteListedResourceAddress(resourceAddress)) {
        return {
          globalEmitter: input.emitter.globalEmitter,
          packageAddress: input.package.address,
          blueprint: input.package.blueprint,
          eventName: input.event.name,
          eventData: {
            type: "DepositNonFungibleEvent",
            data: {
              resourceAddress,
              nftIds,
              accountAddress: input.emitter.globalEmitter,
            },
          },
        };
      }
    }

    const fungibleResult = DepositFungibleEventSchema.safeParse(
      input?.event.payload
    );

    if (fungibleResult.isOk()) {
      const [resourceAddress, amount] = fungibleResult.value.value;

      if (options.isWhiteListedResourceAddress(resourceAddress)) {
        return {
          globalEmitter: input.emitter.globalEmitter,
          packageAddress: input.package.address,
          blueprint: input.package.blueprint,
          eventName: input.event.name,
          eventData: {
            type: "DepositFungibleEvent",
            data: {
              resourceAddress,
              amount,
              accountAddress: input.emitter.globalEmitter,
            },
          },
        };
      }
    }
  }
};

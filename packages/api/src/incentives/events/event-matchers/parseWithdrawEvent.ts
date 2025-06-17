import type { TransformedEvent } from "../../transaction-stream";
import {
  WithdrawFungibleEventSchema,
  WithdrawNonFungibleEventSchema,
} from "./schemas";

export const parseWithdrawEvent = (
  input: TransformedEvent,
  options: {
    isWhiteListedResourceAddress: (resourceAddress: string) => boolean;
  }
) => {
  if (input?.event.name === "WithdrawEvent") {
    const nonFungibleResult = WithdrawNonFungibleEventSchema.safeParse(
      input?.event.payload
    );

    if (nonFungibleResult.isOk()) {
      const [resourceAddress, nftIds] = nonFungibleResult.value.value;

      if (options.isWhiteListedResourceAddress(resourceAddress)) {
        return {
          globalEmitter: input.emitter.globalEmitter,
          packageAddress: input.package.address,
          blueprint: input.package.blueprint,
          eventName: input.event.name,
          eventData: {
            type: "WithdrawNonFungibleEvent",
            data: {
              resourceAddress,
              nftIds,
              accountAddress: input.emitter.globalEmitter,
            },
          },
        };
      }
    }

    const fungibleResult = WithdrawFungibleEventSchema.safeParse(
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
            type: "WithdrawFungibleEvent",
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

import type { TransformedEvent } from "../../transaction-stream";
import { WithdrawNonFungibleEventSchema } from "./schemas";

export const parseWithdrawEvent = (
  input: TransformedEvent,
  options: {
    isWhiteListedResourceAddress: (resourceAddress: string) => boolean;
  }
) => {
  if (input?.event.name === "WithdrawEvent") {
    const result = WithdrawNonFungibleEventSchema.safeParse(
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
  }
};

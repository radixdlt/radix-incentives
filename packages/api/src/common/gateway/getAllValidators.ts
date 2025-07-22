import { Effect } from "effect";
import { GatewayApiClientService } from "./gatewayApiClient";
import { GatewayError } from "./errors";

export type Validator = {
  address: string;
  name: string;
  lsuResourceAddress: string;
  claimNftResourceAddress: string;
};

export class GetAllValidatorsService extends Effect.Service<GetAllValidatorsService>()(
  "GetAllValidatorsService",
  {
    effect: Effect.gen(function* () {
      const gatewayClient = yield* GatewayApiClientService;
      return Effect.fn(function* () {
        const result = yield* Effect.tryPromise({
          try: () => gatewayClient.state.getValidators(),
          catch: (error) => new GatewayError({ error }),
        });

        return result.items.map((item) => {
          const address = item.address;

          const { name, lsuResourceAddress, claimNftResourceAddress } =
            item.metadata.items.reduce(
              (acc, curr) => {
                if (curr.key === "name" && curr.value.typed.type === "String") {
                  acc.name = curr.value.typed.value;
                }
                if (
                  curr.key === "pool_unit" &&
                  curr.value.typed.type === "GlobalAddress"
                ) {
                  acc.lsuResourceAddress = curr.value.typed.value;
                }

                if (
                  curr.key === "claim_nft" &&
                  curr.value.typed.type === "GlobalAddress"
                ) {
                  acc.claimNftResourceAddress = curr.value.typed.value;
                }

                return acc;
              },
              {
                name: "",
                lsuResourceAddress: "",
                claimNftResourceAddress: "",
              }
            );

          return {
            address,
            name,
            lsuResourceAddress,
            claimNftResourceAddress,
          };
        });
      });
    }),
  }
) {}

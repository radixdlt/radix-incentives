import { Context, Effect, Layer } from "effect";
import {
  type GatewayApiClientImpl,
  GatewayApiClientService,
} from "./gatewayApiClient";

export class GetAllValidatorsError {
  readonly _tag = "GetAllValidatorsError";
  constructor(readonly error: unknown) {}
}

export type GetAllValidatorsResult = Awaited<
  ReturnType<GatewayApiClientImpl["gatewayApiClient"]["state"]["getValidators"]>
>;

export class GetAllValidatorsService extends Context.Tag(
  "GetAllValidatorsService"
)<
  GetAllValidatorsService,
  () => Effect.Effect<
    {
      address: string;
      name: string;
      lsuResourceAddress: string;
      claimNftResourceAddress: string;
    }[],
    GetAllValidatorsError,
    GatewayApiClientService
  >
>() {}

export const GetAllValidatorsLive = Layer.effect(
  GetAllValidatorsService,
  Effect.gen(function* () {
    const gatewayClient = yield* GatewayApiClientService;

    return () => {
      return Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: () => gatewayClient.gatewayApiClient.state.getValidators(),
          catch: (error) => {
            return new GetAllValidatorsError(error);
          },
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
    };
  })
);

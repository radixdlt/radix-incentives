import https from "node:https";
import { CoreApiClient } from "@radixdlt/babylon-core-api-sdk";
import { Context, Effect, Layer } from "effect";

import type { PublicKey as GatewayPublicKey } from "@radixdlt/babylon-gateway-api-sdk";
import type { PublicKey } from "@radixdlt/radix-engine-toolkit";

export class CoreNodeError {
  readonly _tag = "CoreNodeError";
  constructor(readonly error: unknown) {}
}

export class MissingBasicAuthError {
  readonly _tag = "MissingBasicAuthError";
}

export const retPublicKeyToGatewayPublicKey = (
  publicKey: PublicKey
): GatewayPublicKey => {
  switch (publicKey.curve) {
    case "Secp256k1":
      return {
        key_type: "EcdsaSecp256k1",
        key_hex: publicKey.hex(),
      };
    case "Ed25519":
      return {
        key_type: "EddsaEd25519",
        key_hex: publicKey.hex(),
      };
  }
};

type CoreApiClientCtor = Parameters<typeof CoreApiClient.initialize>[0];

type CreateCoreApiClientInput = {
  basePath: string;
  logicalNetworkName: CoreApiClientCtor["logicalNetworkName"];
  basicAuth: string;
};

export const createCoreApiClient = async (
  input?: Partial<CreateCoreApiClientInput>
) => {
  const defaultInput = {
    basePath:
      "https://babylon-mainnet-eu-central-1-fullnode1.radixdlt.com/core",
    logicalNetworkName: "mainnet",
    advanced: {
      agent: new https.Agent({
        keepAlive: true,
        // NOTE - Only add the below line if you've taken precautions to avoid MITM attacks between you and the node
        //   rejectUnauthorized: false,
      }),
      headers: {
        Authorization: `Basic ${input?.basicAuth}`,
      },
    },
    ...(input ?? {}),
  } satisfies CoreApiClientCtor;
  return await CoreApiClient.initialize(defaultInput);
};

export class CoreApiClientService extends Context.Tag("CoreApiClientService")<
  CoreApiClientService,
  () => Effect.Effect<CoreApiClient, MissingBasicAuthError | CoreNodeError>
>() {}

export const CoreApiClientLive = Layer.effect(
  CoreApiClientService,
  Effect.gen(function* () {
    return () =>
      Effect.gen(function* () {
        const basicAuth = process.env.CORE_NODE_BASIC_AUTH;

        if (!basicAuth) {
          return yield* Effect.fail(new MissingBasicAuthError());
        }

        const result = yield* Effect.tryPromise({
          try: () => createCoreApiClient({ basicAuth }),
          catch: (error) => new CoreNodeError(error),
        });

        return result;
      });
  })
);

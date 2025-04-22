"use client";

import { useState, createContext, useEffect } from "react";
import {
  DataRequestBuilder,
  RadixDappToolkit,
} from "@radixdlt/radix-dapp-toolkit";
import { api } from "~/trpc/react";

export const RadixContext = createContext<RadixDappToolkit | null>(null);

const createRdtClient = () => {
  const signOut = api.auth.signOut.useMutation();

  const rdt = RadixDappToolkit({
    dAppDefinitionAddress:
      "account_rdx12xwrtgmq68wqng0d69qx2j627ld2dnfufdklkex5fuuhc8eaeltq2k",
    networkId: 1,
    onDisconnect: async () => {
      await signOut.mutateAsync();
    },
  });

  rdt.buttonApi.setMode("dark");
  rdt.buttonApi.setTheme("white");

  rdt.walletApi.setRequestData(DataRequestBuilder.persona().withProof());

  return rdt;
};

let rdtSingleton: RadixDappToolkit | undefined = undefined;

const getRdt = () => {
  if (typeof window === "undefined") {
    // RDT is not available on server
    return;
  }
  // Browser: use singleton pattern to keep the same query client
  rdtSingleton ??= createRdtClient();

  return rdtSingleton;
};

export function RadixDappToolkitProvider(props: { children: React.ReactNode }) {
  const rdtClient = getRdt();

  const [rdt] = useState(() => rdtClient);

  const signIn = api.auth.signIn.useMutation();

  const generateChallenge = api.auth.generateChallenge.useMutation({});
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    rdt?.walletApi.provideChallengeGenerator(() =>
      generateChallenge.mutateAsync()
    );

    rdt?.walletApi.setRequestData(DataRequestBuilder.persona().withProof());

    rdt?.walletApi.dataRequestControl(async (request) => {
      if (
        !request.persona ||
        !request.proofs ||
        !request.proofs[0] ||
        request.proofs[0].type !== "persona"
      ) {
        return;
      }

      const { address, type, challenge, proof } = request.proofs[0];
      const { label } = request.persona;

      const result = await signIn.mutateAsync({
        address,
        type,
        label,
        challenge,
        proof,
      });

      if (!result.success) {
        throw new Error("Proof verification failed");
      }
    });

    return () => {
      rdt?.destroy();
    };
  }, []);

  return (
    <RadixContext.Provider value={rdt ?? null}>
      {props.children}
    </RadixContext.Provider>
  );
}

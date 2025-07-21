"use client";

import { useState, createContext, useEffect, useRef } from "react";
import {
  DataRequestBuilder,
  RadixDappToolkit,
  type Persona,
} from "@radixdlt/radix-dapp-toolkit";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { usePersonaConnectionWarning } from "~/components/ui/PersonaConnectionWarning";

export const RadixContext = createContext<RadixDappToolkit | null>(null);

// biome-ignore lint/style/useConst: <explanation>
let rdtSingleton: RadixDappToolkit | undefined = undefined;

export function RadixDappToolkitProvider(props: { children: React.ReactNode }) {
  const signIn = api.auth.signIn.useMutation({ retry: false, retryDelay: 0 });
  const signOut = api.auth.signOut.useMutation();
  const generateChallenge = api.auth.generateChallenge.useMutation({});
  const [rdt, setRdt] = useState<RadixDappToolkit | undefined>(undefined);
  const [persona, setPersona] = useState<Persona | undefined>(undefined);
  const { showWarning, WarningDialog } = usePersonaConnectionWarning();
  const personaRef = useRef(persona);

  personaRef.current = persona;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // RDT is not available on server
    if (typeof window === "undefined") return;

    const rdt =
      rdtSingleton ??
      RadixDappToolkit({
        dAppDefinitionAddress:
          "account_rdx129zzrj4mwjwec8e6rmsvcz0hx4lp7uj3kf73w8rd2fek4cryaemewh",
        networkId: 1,
        onDisconnect: async () => {
          await signOut.mutateAsync();
        },
      });

    setRdt(rdt);

    rdt.buttonApi.setMode("dark");
    rdt.buttonApi.setTheme("white");

    rdt.walletApi.setRequestData(DataRequestBuilder.persona().withProof());

    // Subscribe to persona changes directly in the provider
    const subscription = rdt.walletApi.walletData$.subscribe((walletData) => {
      setPersona(walletData.persona);
    });

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

      try {
        const result = await signIn.mutateAsync({
          address,
          type,
          label,
          challenge,
          proof,
        });
      } catch (error) {
        rdt.disconnect();
      }
    });

    return () => {
      subscription?.unsubscribe();
      rdt?.destroy();
    };
  }, []);

  // Set up challenge generator when RDT is ready
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!rdt) return;

    rdt.walletApi.provideChallengeGenerator(async () => {
      const currentPersona = personaRef.current;

      // Only show warning if no persona is connected (first-time users)
      if (!currentPersona) {
        const userConfirmed = await showWarning();
        if (!userConfirmed) {
          throw new Error("User cancelled persona connection");
        }
      }

      toast.info("Open your wallet to continue");
      return generateChallenge.mutateAsync();
    });
  }, [rdt]);

  return (
    <RadixContext.Provider value={rdt ?? null}>
      {props.children}
      <WarningDialog />
    </RadixContext.Provider>
  );
}

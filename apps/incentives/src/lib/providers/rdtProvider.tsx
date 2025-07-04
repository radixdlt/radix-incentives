'use client';

import { useState, createContext, useEffect } from 'react';
import {
  DataRequestBuilder,
  RadixDappToolkit,
} from '@radixdlt/radix-dapp-toolkit';
import { api } from '~/trpc/react';
import { toast } from 'sonner';

export const RadixContext = createContext<RadixDappToolkit | null>(null);

// biome-ignore lint/style/useConst: <explanation>
let rdtSingleton: RadixDappToolkit | undefined = undefined;

export function RadixDappToolkitProvider(props: { children: React.ReactNode }) {
  const signIn = api.auth.signIn.useMutation({ retry: false, retryDelay: 0 });
  const signOut = api.auth.signOut.useMutation();
  const generateChallenge = api.auth.generateChallenge.useMutation({});
  const [rdt, setRdt] = useState<RadixDappToolkit | undefined>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // RDT is not available on server
    if (typeof window === 'undefined') return;

    const rdt =
      rdtSingleton ??
      RadixDappToolkit({
        dAppDefinitionAddress:
          'account_rdx129xqyvgkn9h73atyrzndal004fwye3tzw49kkygv9ltm2kyrv2lmda',
        networkId: 1,
        onDisconnect: async () => {
          await signOut.mutateAsync();
        },
      });

    setRdt(rdt);

    rdt.buttonApi.setMode('dark');
    rdt.buttonApi.setTheme('white');

    rdt.walletApi.setRequestData(DataRequestBuilder.persona().withProof());

    rdt?.walletApi.provideChallengeGenerator(() => {
      toast.info('Open your wallet to continue');
      return generateChallenge.mutateAsync();
    });

    rdt?.walletApi.setRequestData(DataRequestBuilder.persona().withProof());

    rdt?.walletApi.dataRequestControl(async (request) => {
      if (
        !request.persona ||
        !request.proofs ||
        !request.proofs[0] ||
        request.proofs[0].type !== 'persona'
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
      rdt?.destroy();
    };
  }, []);

  return (
    <RadixContext.Provider value={rdt ?? null}>
      {props.children}
    </RadixContext.Provider>
  );
}

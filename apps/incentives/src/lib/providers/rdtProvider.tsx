'use client';

import {
  DataRequestBuilder,
  type Persona,
  RadixDappToolkit,
} from '@radixdlt/radix-dapp-toolkit';

import { createContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { usePersonaConnectionWarning } from '~/components/ui/PersonaConnectionWarning';
import { useReferrerInputModal } from '~/components/ui/ReferrerInputModal';
import { useReferralCode } from '~/lib/hooks/useReferralCode';
import { api } from '~/trpc/react';

export const RadixContext = createContext<RadixDappToolkit | null>(null);

let rdtSingleton: RadixDappToolkit | undefined;

export function RadixDappToolkitProvider(props: { children: React.ReactNode }) {
  const signIn = api.auth.signIn.useMutation({ retry: false, retryDelay: 0 });
  const signOut = api.auth.signOut.useMutation();
  const generateChallenge = api.auth.generateChallenge.useMutation({});
  const [rdt, setRdt] = useState<RadixDappToolkit | undefined>(undefined);
  const [persona, setPersona] = useState<Persona | undefined>(undefined);
  const { showWarning, WarningDialog } = usePersonaConnectionWarning();
  const { showModal: showReferrerInputModal, Modal: ReferrerInputModal } =
    useReferrerInputModal();
  const personaRef = useRef(persona);
  const { clearCookie, setCookieFromSearchParams } = useReferralCode();
  const userExists = api.user.userExists.useMutation();

  personaRef.current = persona;

  useEffect(() => {
    // RDT is not available on server
    if (typeof window === 'undefined') return;

    setCookieFromSearchParams();

    const rdt =
      rdtSingleton ??
      RadixDappToolkit({
        dAppDefinitionAddress:
          'account_rdx129zzrj4mwjwec8e6rmsvcz0hx4lp7uj3kf73w8rd2fek4cryaemewh',
        networkId: 1,
        onDisconnect: async () => {
          await signOut.mutateAsync();
        },
      });

    setRdt(rdt);

    rdt.buttonApi.setMode('dark');
    rdt.buttonApi.setTheme('white');

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
        request.proofs[0].type !== 'persona'
      ) {
        return;
      }

      const { address, type, challenge, proof } = request.proofs[0];
      const { label } = request.persona;

      try {
        const userExistsResult = await userExists.mutateAsync({
          identityAddress: address,
        });
        if (!userExistsResult) {
          await showReferrerInputModal();
        }

        await signIn.mutateAsync({
          address,
          type,
          label,
          challenge,
          proof,
        });
        clearCookie();
      } catch (error) {
        rdt.disconnect();
        toast.error(
          error instanceof Error ? error.message : 'Failed to sign in',
        );
        // need to throw error to prevent RDT from getting into a logged in state
        throw error;
      }
    });

    return () => {
      subscription?.unsubscribe();
      rdt?.destroy();
    };
  }, []);

  // Set up challenge generator when RDT is ready
  useEffect(() => {
    if (!rdt) return;

    rdt.walletApi.provideChallengeGenerator(async () => {
      const currentPersona = personaRef.current;

      // Only show warning if no persona is connected (first-time users)
      if (!currentPersona) {
        const userConfirmed = await showWarning();
        if (!userConfirmed) {
          throw new Error('User cancelled persona connection');
        }
      }

      toast.info('Open your wallet to continue');
      return generateChallenge.mutateAsync();
    });
  }, [rdt]);

  return (
    <RadixContext.Provider value={rdt ?? null}>
      {props.children}
      <WarningDialog />
      <ReferrerInputModal />
    </RadixContext.Provider>
  );
}

import type { Persona } from '@radixdlt/radix-dapp-toolkit';
import { useEffect, useState } from 'react';
import { api } from '~/trpc/react';
import { useDappToolkit } from './useRdt';

// Module-level variable to persist persona state across navigation
let globalLastKnownAddress: string | undefined;

export const usePersona = () => {
  const rdt = useDappToolkit();
  const [persona, setPersona] = useState<Persona | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | undefined>();
  const [previousIsConnected, setPreviousIsConnected] = useState<
    boolean | undefined
  >();
  const utils = api.useUtils();

  useEffect(() => {
    if (!rdt) {
      return;
    }

    let currentIsConnected = isConnected;
    let currentPreviousIsConnected = previousIsConnected;

    const subscription = rdt.walletApi.walletData$.subscribe((walletData) => {
      const newPersona = walletData.persona;
      const currentAddress = newPersona?.identityAddress;
      const connectionStatus = !!currentAddress;

      // Mark as initialized after first subscription call
      if (!isInitialized) {
        setIsInitialized(true);
      }

      setPersona(newPersona);

      // Invalidate cache only when truly necessary:
      // 1. User disconnects
      if (currentPreviousIsConnected === true && connectionStatus === false) {
        void utils.user.getUserCapitalAtWork.invalidate();
        void utils.user.getMultiplierByUserId.invalidate();
        void utils.user.getUserCategoryBreakdown.invalidate();
        void utils.resourceReward.getUserResourceRewards.invalidate();
      }
      // 2. New persona connects (different from last known)
      else if (currentAddress && globalLastKnownAddress !== currentAddress) {
        void utils.user.getUserCapitalAtWork.invalidate();
        void utils.user.getMultiplierByUserId.invalidate();
        void utils.user.getUserCategoryBreakdown.invalidate();
        void utils.resourceReward.getUserResourceRewards.invalidate();
        globalLastKnownAddress = currentAddress;
      }

      // Update states
      currentPreviousIsConnected = currentIsConnected;
      currentIsConnected = connectionStatus;
      setPreviousIsConnected(currentIsConnected);
      setIsConnected(connectionStatus);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [rdt, utils, isInitialized, isConnected, previousIsConnected]);

  return {
    persona,
    isConnected: isInitialized ? isConnected : undefined,
    isInitialized,
  };
};

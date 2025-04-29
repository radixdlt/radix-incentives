import { useEffect, useState } from "react";
import { useDappToolkit } from "./useRdt";
import type { Persona } from "@radixdlt/radix-dapp-toolkit";

export const usePersona = () => {
  const rdt = useDappToolkit();
  const [persona, setPersona] = useState<Persona | undefined>();

  useEffect(() => {
    if (!rdt) {
      return;
    }

    const subscription = rdt.walletApi.walletData$.subscribe((walletData) => {
      setPersona(walletData.persona);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [rdt]);

  return persona;
};

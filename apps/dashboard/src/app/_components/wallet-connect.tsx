"use client";

import { useEffect } from "react";
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

export function WalletConnect() {
  useEffect(() => {
    const rdt = RadixDappToolkit({
      dAppDefinitionAddress:
        "account_rdx12xwrtgmq68wqng0d69qx2j627ld2dnfufdklkex5fuuhc8eaeltq2k",
      networkId: 1,
    });

    rdt.buttonApi.setMode("dark");
    rdt.buttonApi.setTheme("white");

    return () => {
      rdt.destroy();
    };
  }, []);

  return <radix-connect-button></radix-connect-button>;
}

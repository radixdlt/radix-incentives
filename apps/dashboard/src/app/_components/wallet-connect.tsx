"use client";

import { useState } from "react";

type WalletState = {
  connected: boolean;
  accountAddress?: string;
  isVerified?: boolean;
};

export function WalletConnect() {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
  });

  const connectWallet = async () => {
    // This would integrate with Radix Connect in the full implementation
    console.log("Connecting wallet...");

    // Simulating successful connection
    setWalletState({
      connected: true,
      accountAddress: "account_ab...z21",
      isVerified: false,
    });
  };

  const verifyAccount = async () => {
    // This would integrate with ROLA verification in the full implementation
    console.log("Verifying account...");

    // Simulating successful verification
    setWalletState((prev) => ({
      ...prev,
      isVerified: true,
    }));
  };

  const disconnectWallet = () => {
    setWalletState({
      connected: false,
    });
  };

  if (!walletState.connected) {
    return (
      <button
        type="button"
        onClick={connectWallet}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90"
      >
        Connect Wallet
      </button>
    );
  }

  if (walletState.connected && !walletState.isVerified) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{walletState.accountAddress}</span>
        <button
          type="button"
          onClick={verifyAccount}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-yellow-500 text-white shadow hover:bg-yellow-600"
        >
          Verify
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{walletState.accountAddress}</span>
      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
        Verified
      </span>
      <button
        type="button"
        onClick={disconnectWallet}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md w-8 h-8 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <title>Disconnect</title>
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" x2="6" y1="1" y2="4" />
          <line x1="10" x2="10" y1="1" y2="4" />
          <line x1="14" x2="14" y1="1" y2="4" />
        </svg>
      </button>
    </div>
  );
}

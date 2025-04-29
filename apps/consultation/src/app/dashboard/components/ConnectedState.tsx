import { Loader2, Wallet } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

import { usePersona } from "~/lib/hooks/usePersona";
import { useDappToolkit } from "~/lib/hooks/useRdt";

import type { FC, ReactNode } from "react";
import { EmptyState } from "~/components/ui/empty-state";

interface ConnectedStateProps {
  children: ReactNode;
}

export const ConnectedState: FC<ConnectedStateProps> = ({ children }) => {
  const persona = usePersona();
  const rdt = useDappToolkit();

  const handleConnectWallet = () => {
    rdt?.walletApi.sendRequest();
  };

  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const subscription = rdt?.buttonApi.status$.subscribe((status) => {
      setIsConnecting(status === "pending");
    });

    return () => subscription?.unsubscribe();
  }, [rdt]);

  if (!persona) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center pt-16">
        <div className="space-y-4">
          <EmptyState
            title="Not connected"
            description="Connect your Radix wallet to get started."
            icon={Wallet}
            className="max-w-full"
          >
            <Button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="mt-4"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </EmptyState>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

"use client";

import { WagmiProvider, useConnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function AutoConnectWallet() {
  const { connect, connectors } = useConnect();

  useEffect(() => {
    // Auto-connect wallet saat app load
    const farcasterConnector = connectors.find(
      (c) => c.id === "farcaster"
    );
    if (farcasterConnector) {
      connect({ connector: farcasterConnector });
    }
  }, [connect, connectors]);

  return null;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {mounted && <AutoConnectWallet />}
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

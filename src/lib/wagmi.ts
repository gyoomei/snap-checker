"use client";

import { createConfig, http } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

// Wagmi config untuk Farcaster Mini App
export const wagmiConfig = createConfig({
  chains: [mainnet, base],
  connectors: [farcasterMiniApp()],
  transports: {
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
    [base.id]: http("https://mainnet.base.org"),
  },
});

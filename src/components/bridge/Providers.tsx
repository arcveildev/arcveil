"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";

/**
 * Wallet plumbing for /bridge, and nowhere else on the site.
 *
 * Injected wallets only. WalletConnect would need a project id, which means a
 * third party sees which addresses open this page — on a page about not being
 * seen, that is not a trade worth making silently.
 *
 * The chains here are the source chains a burn can start from. Arc itself is
 * absent on purpose: you do not bridge from Arc to Arc, and the withdrawal is
 * submitted by the relayer, so the browser never needs to hold gas there.
 */
const config = createConfig({
  chains: [mainnet, base, arbitrum, optimism, polygon],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true,
});

export function BridgeProviders({ children }: { children: ReactNode }) {
  // One client per mount, never shared across requests on the server.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

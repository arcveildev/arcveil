"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import type { Transport } from "viem";
import { createConfig, http, WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";

import { veilWalletChains } from "@/lib/veilNetwork";

/**
 * Wallet plumbing for /bridge, and nowhere else on the site.
 *
 * Injected wallets only. WalletConnect would need a project id, which means a
 * third party sees which addresses open this page — on a page about not being
 * seen, that is not a trade worth making silently.
 *
 * The chains here are the source chains a burn can start from, taken from the
 * same place the deposit panel takes its buttons: a wallet that cannot be
 * switched to a chain the panel offers is a button that does nothing. Arc
 * itself is absent on purpose — you do not bridge from Arc to Arc, and the
 * withdrawal is submitted by the relayer, so the browser never needs to hold
 * gas there.
 */
const chains = veilWalletChains();

const config = createConfig({
  chains,
  connectors: [injected()],
  transports: Object.fromEntries(chains.map((chain) => [chain.id, http()])) as Record<number, Transport>,
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

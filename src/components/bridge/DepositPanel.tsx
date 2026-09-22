"use client";

import type { CctpRoute } from "@arcveil/bridge";
import { useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

import { FigureLabel } from "@/components/ui/FigureLabel";
import { formatUsdc, parseUsdc, shortAddress } from "@/lib/veil";
import { veilSources } from "@/lib/veilNetwork";
import type { VeilConfig } from "@/lib/veilConfig";
import { useDeposit, type DepositStage } from "./useDeposit";
import type { VeilKey } from "./useVeilKey";

/**
 * The deposit half: connect a wallet, choose where the USDC comes from, and
 * send it.
 *
 * Each stage is named while it runs. A bridge that says "something went wrong"
 * after taking 25 USDC is not one anybody uses twice.
 */

// Testnet feeds testnet and mainnet feeds mainnet — `veilSources` reads the
// network the pool is on, so these are never the other one's chains.
const ROUTES = veilSources().map(({ route }) => route);

const STAGE_COPY: Readonly<Record<DepositStage, string>> = {
  idle: "",
  approving: "Approving the USDC. One wallet confirmation.",
  burning: "Burning it on the source chain. A second confirmation.",
  attesting: "Waiting for Circle to attest the burn. Minutes, not seconds.",
  delivering: "Handing the attestation to the relayer, which pays the gas on Arc.",
  done: "In the pool.",
};

export function DepositPanel({
  config,
  veilKey,
  nextIndex,
  onDeposited,
}: {
  config: VeilConfig | null;
  veilKey: VeilKey;
  nextIndex: number;
  onDeposited: () => void;
}) {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { state, run } = useDeposit(config);

  const [amount, setAmount] = useState("25");
  const parsed = parseUsdc(amount);

  const route = useMemo<CctpRoute | undefined>(
    () => ROUTES.find((candidate) => candidate.chainId === chainId),
    [chainId],
  );

  const busy = state.stage !== "idle" && state.stage !== "done";
  const ready = config !== null && route !== undefined && parsed !== null && address !== undefined;

  const deposit = async () => {
    if (!ready || !route || parsed === null || !address) return;
    const signature = veilKey.signature ?? (await veilKey.sign());
    if (!signature) return;

    await run({ route, amount: parsed, signature, noteIndex: nextIndex, refund: address });
    onDeposited();
  };

  const injected = connectors[0];

  return (
    <div className="flex flex-col gap-4 p-4 md:p-5">
      <FigureLabel n={1} />
      <div className="text-xl lg:text-h3-title">Deposit.</div>

      {!isConnected ? (
        <>
          <p className="text-sm leading-140 text-fg-muted">
            Connect the wallet holding the USDC. Injected wallets only — WalletConnect would tell a third party which
            addresses open this page, which is a strange trade on a page about not being seen.
          </p>
          <button
            type="button"
            onClick={() => injected && connect({ connector: injected })}
            disabled={!injected || isPending}
            className="label w-fit border border-border bg-fg/5 px-4 py-2 transition-colors hover:bg-fg/10 disabled:text-fg-subtle"
          >
            {isPending ? "Connecting…" : "Connect wallet"}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 border border-border px-3 py-2">
            <span className="font-mono text-xs text-fg-muted">{address && shortAddress(address)}</span>
            <button type="button" onClick={() => disconnect()} className="label-2xs text-fg-subtle hover:text-fg">
              Disconnect
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="label-2xs text-fg-subtle">From</span>
            <div className="flex flex-wrap gap-2">
              {ROUTES.map((candidate) => (
                <button
                  key={candidate.chainId}
                  type="button"
                  disabled={busy}
                  onClick={() => switchChain({ chainId: candidate.chainId })}
                  className={`label-2xs border px-3 py-1.5 transition-colors disabled:opacity-40 ${
                    candidate.chainId === chainId
                      ? "border-accent text-accent"
                      : "border-border text-fg-muted hover:text-fg"
                  }`}
                >
                  {candidate.name}
                </button>
              ))}
            </div>
            {route === undefined && (
              <p className="text-2xs text-fg-faint">Switch your wallet to one of these to continue.</p>
            )}
          </div>

          <label className="flex flex-col gap-2">
            <span className="label-2xs text-fg-subtle">Amount, USDC</span>
            <input
              value={amount}
              disabled={busy}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              className="border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-fg/40 disabled:text-fg-subtle"
            />
            {parsed === null && (
              <span className="text-2xs text-chart-5">USDC has six decimals; this is not an amount.</span>
            )}
          </label>

          <button
            type="button"
            onClick={() => void deposit()}
            disabled={!ready || busy}
            className="label w-fit border border-border bg-fg/5 px-4 py-2 transition-colors hover:bg-fg/10 disabled:cursor-not-allowed disabled:text-fg-subtle"
          >
            {busy ? "Working…" : `Deposit ${parsed === null ? "" : formatUsdc(parsed)} USDC`}
          </button>
        </>
      )}

      {config === null && (
        <p className="text-2xs leading-140 text-chart-2">
          Disabled until the gateway is deployed. The transactions are built here and sent from your wallet; there is
          nothing to send them to yet.
        </p>
      )}

      {state.stage !== "idle" && (
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <span className={`label-2xs ${state.stage === "done" ? "text-accent" : "text-fg-subtle"}`}>
            {state.stage}
          </span>
          <p className="text-xs leading-140 text-fg-muted">{STAGE_COPY[state.stage]}</p>
          {state.stage === "attesting" && state.polls > 1 && (
            <p className="text-2xs text-fg-faint">Asked Circle {state.polls} times. The USDC is burnt and safe.</p>
          )}
          {state.burnHash && (
            <p className="font-mono text-2xs text-fg-faint">burn {shortAddress(state.burnHash)}</p>
          )}
          {state.deliveryHash && (
            <p className="font-mono text-2xs text-accent">deposit {shortAddress(state.deliveryHash)}</p>
          )}
        </div>
      )}

      {(state.error ?? veilKey.error) && (
        <p className="text-xs leading-140 text-chart-5">{state.error ?? veilKey.error}</p>
      )}
    </div>
  );
}

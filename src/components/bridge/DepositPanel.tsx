"use client";

import { approveCall, burnCall, deriveNote, routesInto, type CctpRoute } from "@arcveil/bridge";
import { useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignTypedData, useSwitchChain } from "wagmi";
import { FigureLabel } from "@/components/ui/FigureLabel";
import { NOTE_COPY } from "@/data/bridge";
import { ARC, VEIL } from "@/data/site";
import { formatUsdc, parseUsdc, shortAddress, shortField } from "@/lib/veil";

/**
 * The deposit half: connect a wallet, pick where the USDC comes from, sign the
 * one signature every note is derived from, and see exactly what the burn
 * would publish.
 *
 * The burn itself is disabled until `VEIL.gateway` is a real address. A form
 * that looks live and silently does nothing is worse than one that says why.
 */

const ROUTES = routesInto(ARC.chainId);

const veilKeyTypedData = (gateway: `0x${string}`) =>
  ({
    domain: { name: "Arcveil Veil", version: "1", chainId: ARC.chainId, verifyingContract: gateway },
    types: {
      VeilKey: [
        { name: "purpose", type: "string" },
        { name: "warning", type: "string" },
      ],
    },
    primaryType: "VeilKey" as const,
    message: {
      purpose: "Derive the keys that spend this wallet's shielded deposits on Arc.",
      warning: "Anyone who obtains this signature can spend every one of them. Sign only on arcveil.dev.",
    },
  }) as const;

export function DepositPanel() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { signTypedDataAsync } = useSignTypedData();

  const [amount, setAmount] = useState("25");
  const [signature, setSignature] = useState<`0x${string}` | null>(null);

  const route = useMemo<CctpRoute | undefined>(
    () => ROUTES.find((candidate) => candidate.chainId === chainId) ?? ROUTES[0],
    [chainId],
  );

  const parsed = parseUsdc(amount);
  const note = signature ? deriveNote(signature, 0) : null;

  const calls = useMemo(() => {
    if (!route || parsed === null || !note || !VEIL.gateway) return null;
    return {
      approve: approveCall({ route, amount: parsed }),
      burn: burnCall({
        route,
        amount: parsed,
        gateway: VEIL.gateway,
        hook: { precommitment: note.precommitment, refund: address ?? VEIL.gateway },
      }),
    };
  }, [route, parsed, note, address]);

  const sign = async () => {
    if (!VEIL.gateway) return;
    setSignature(await signTypedDataAsync(veilKeyTypedData(VEIL.gateway)));
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
                  onClick={() => switchChain({ chainId: candidate.chainId })}
                  className={`label-2xs border px-3 py-1.5 transition-colors ${
                    candidate.chainId === chainId
                      ? "border-accent text-accent"
                      : "border-border text-fg-muted hover:text-fg"
                  }`}
                >
                  {candidate.name}
                </button>
              ))}
            </div>
            {route && chainId !== route.chainId && (
              <p className="text-2xs text-fg-faint">Switch your wallet to one of these to continue.</p>
            )}
          </div>

          <label className="flex flex-col gap-2">
            <span className="label-2xs text-fg-subtle">Amount, USDC</span>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              className="border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-fg/40"
            />
            {parsed === null && <span className="text-2xs text-chart-5">USDC has six decimals; this is not an amount.</span>}
          </label>
        </>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <span className="label-2xs text-fg-subtle">{NOTE_COPY.title}</span>
        <p className="text-xs leading-140 text-fg-muted">{NOTE_COPY.body}</p>
        <p className="text-2xs leading-140 text-fg-faint">{NOTE_COPY.warning}</p>

        {VEIL.gateway === null ? (
          <p className="text-2xs leading-140 text-chart-2">
            The signature is bound to the gateway&apos;s address, so it cannot be produced before the gateway exists.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void sign()}
            disabled={!isConnected}
            className="label w-fit border border-border bg-fg/5 px-4 py-2 transition-colors hover:bg-fg/10 disabled:text-fg-subtle"
          >
            {signature ? "Signed" : "Sign the veil key"}
          </button>
        )}

        {note && (
          <dl className="mt-2 flex flex-col border border-border">
            <div className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2">
              <dt className="label-2xs text-fg-subtle">precommitment</dt>
              <dd className="font-mono text-2xs text-fg-muted">{shortField(note.precommitment)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 px-3 py-2">
              <dt className="label-2xs text-fg-subtle">published amount</dt>
              <dd className="font-mono text-2xs text-fg-muted">{parsed === null ? "—" : `${formatUsdc(parsed)} USDC`}</dd>
            </div>
          </dl>
        )}
      </div>

      {calls === null ? (
        <p className="mt-auto pt-2 text-2xs leading-140 text-fg-faint">
          The burn is built here and sent from your wallet. It is disabled until the gateway is deployed.
        </p>
      ) : (
        <p className="mt-auto pt-2 text-2xs leading-140 text-fg-faint">
          Two transactions: approve {formatUsdc(parsed ?? 0n)} USDC to {shortAddress(calls.approve.to)}, then burn it to
          the gateway.
        </p>
      )}
    </div>
  );
}

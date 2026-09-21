"use client";

import { isSpendable, type OwnedDeposit, type PoolState } from "@arcveil/bridge";
import { isAddress } from "viem";
import { useState } from "react";

import { FigureLabel } from "@/components/ui/FigureLabel";
import { formatUsdc, parseUsdc, shortAddress, shortField } from "@/lib/veil";
import type { VeilConfig } from "@/lib/veilConfig";
import { useWithdraw } from "./useWithdraw";
import type { VeilKey } from "./useVeilKey";

/**
 * The withdrawal half: find what is yours, prove you can spend it, let a
 * stranger submit it.
 *
 * The recipient should be an address with no history of yours attached to it.
 * The page says so rather than assuming anyone knows, because a withdrawal to
 * the wallet that made the deposit undoes the entire exercise.
 */

const megabytes = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;

export function WithdrawPanel({
  config,
  veilKey,
  state: pool,
  owned,
  nextIndex,
  onWithdrawn,
}: {
  config: VeilConfig | null;
  veilKey: VeilKey;
  state: PoolState | null;
  owned: readonly OwnedDeposit[];
  nextIndex: number;
  onWithdrawn: () => void;
}) {
  const { state, run } = useWithdraw(config);
  const [selected, setSelected] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const choice = owned[selected];
  const parsed = parseUsdc(amount);
  const busy = state.stage !== "idle" && state.stage !== "done";
  const spendable = pool && choice ? isSpendable(pool, choice.deposit) : false;

  const ready =
    config !== null && pool !== null && choice !== undefined && spendable && parsed !== null && isAddress(recipient);

  const withdraw = async () => {
    if (!ready || !pool || !choice || parsed === null) return;
    const signature = veilKey.signature ?? (await veilKey.sign());
    if (!signature) return;

    await run({
      state: pool,
      owned: choice,
      amount: parsed,
      recipient: recipient as `0x${string}`,
      signature,
      changeIndex: nextIndex,
    });
    onWithdrawn();
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-5">
      <FigureLabel n={2} />
      <div className="text-xl lg:text-h3-title">Withdraw.</div>

      {!veilKey.signature ? (
        <>
          <p className="text-sm leading-140 text-fg-muted">
            Your deposits are found by deriving them, not by asking anyone. Sign the veil key and this page looks for
            the deposits that match — locally, against values only that signature can produce.
          </p>
          <button
            type="button"
            onClick={() => void veilKey.sign()}
            disabled={veilKey.signing || config === null}
            className="label w-fit border border-border bg-fg/5 px-4 py-2 transition-colors hover:bg-fg/10 disabled:text-fg-subtle"
          >
            {veilKey.signing ? "Waiting for the wallet…" : "Find my deposits"}
          </button>
        </>
      ) : owned.length === 0 ? (
        <p className="text-sm leading-140 text-fg-muted">
          Nothing in the pool belongs to this key yet.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <span className="label-2xs text-fg-subtle">Yours in the pool</span>
            <div className="flex flex-col border border-border">
              {owned.map((entry, index) => (
                <button
                  key={entry.deposit.commitment.toString()}
                  type="button"
                  disabled={busy}
                  onClick={() => setSelected(index)}
                  className={`flex items-baseline justify-between gap-3 border-b border-border px-3 py-2 text-left last:border-b-0 disabled:opacity-40 ${
                    index === selected ? "bg-fg/5" : ""
                  }`}
                >
                  <span className="font-mono text-2xs text-fg-muted">
                    {shortField(entry.deposit.commitment)}
                  </span>
                  <span className="text-xs">{formatUsdc(entry.deposit.value)} USDC</span>
                </button>
              ))}
            </div>
            {choice && !spendable && (
              <p className="text-2xs leading-140 text-chart-2">
                This deposit&apos;s label is not in the published association set yet, so it cannot be spent privately.
                It can still be pulled back publicly through the gateway, which needs nobody&apos;s permission.
              </p>
            )}
          </div>

          <label className="flex flex-col gap-2">
            <span className="label-2xs text-fg-subtle">To — an address with none of your history on it</span>
            <input
              value={recipient}
              disabled={busy}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="0x…"
              className="border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-fg/40 disabled:text-fg-subtle"
            />
            {recipient !== "" && !isAddress(recipient) && (
              <span className="text-2xs text-chart-5">That is not an address.</span>
            )}
          </label>

          <label className="flex flex-col gap-2">
            <span className="label-2xs text-fg-subtle">Amount, USDC</span>
            <input
              value={amount}
              disabled={busy}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder={choice ? formatUsdc(choice.deposit.value) : "0"}
              className="border border-border bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-fg/40 disabled:text-fg-subtle"
            />
            <span className="text-2xs leading-140 text-fg-faint">
              Withdraw an amount nobody deposited, at a time nobody would expect, or the arithmetic gives you away
              whatever the proof says.
            </span>
          </label>

          <button
            type="button"
            onClick={() => void withdraw()}
            disabled={!ready || busy}
            className="label w-fit border border-border bg-fg/5 px-4 py-2 transition-colors hover:bg-fg/10 disabled:cursor-not-allowed disabled:text-fg-subtle"
          >
            {busy ? "Working…" : "Withdraw"}
          </button>
        </>
      )}

      {config === null && (
        <p className="text-2xs leading-140 text-chart-2">
          Disabled until the pool and a relayer exist.
        </p>
      )}

      {state.plan && (
        <p className="text-2xs leading-140 text-fg-faint">
          Proving leaf {state.plan.leafIndex + 1} of {state.plan.leafCount}, hidden among {state.plan.anonymitySet}{" "}
          deposits.
        </p>
      )}

      {busy && (
        <div className="flex flex-col gap-1">
          <span className="label-2xs text-fg-subtle">{state.stageLabel || state.stage}</span>
          {state.total > 0 && (
            <>
              <div className="h-px w-full bg-fg/10">
                <div
                  className="h-px bg-accent transition-[width]"
                  style={{ width: `${Math.round((state.loaded / state.total) * 100)}%` }}
                />
              </div>
              <span className="text-2xs text-fg-faint">
                {megabytes(state.loaded)} of {megabytes(state.total)}
              </span>
            </>
          )}
        </div>
      )}

      {state.hash && (
        <p className="font-mono text-2xs text-accent">
          withdrawn {shortAddress(state.hash)}
          {state.provedMs !== null && <span className="text-fg-faint"> · proved in {state.provedMs} ms</span>}
        </p>
      )}

      {(state.error ?? veilKey.error) && (
        <p className="text-xs leading-140 text-chart-5">{state.error ?? veilKey.error}</p>
      )}
    </div>
  );
}

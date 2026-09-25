"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { castSignCommand } from "@/lib/fundingMessage";

type Eip1193 = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };

const wallet = (): Eip1193 | null =>
  typeof window === "undefined" ? null : ((window as unknown as { ethereum?: Eip1193 }).ethereum ?? null);

/** Shows the exact message, and two ways to sign it: a browser wallet, or cast for a keystore key. */
export function SignStep({
  message,
  signature,
  onSignature,
  onRefresh,
}: {
  message: string;
  signature: string;
  onSignature: (value: string) => void;
  onRefresh: () => void;
}) {
  const [note, setNote] = useState<string | null>(null);
  const command = castSignCommand(message);

  const signInWallet = async () => {
    const provider = wallet();
    if (provider === null) {
      setNote("No browser wallet found. Use the cast command instead.");
      return;
    }
    try {
      const [from] = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const signed = (await provider.request({ method: "personal_sign", params: [message, from] })) as string;
      onSignature(signed);
      setNote(`Signed by ${from}. The Worker will ask the account whether that key is one of its three.`);
    } catch (error) {
      setNote(error instanceof Error ? error.message : "The wallet did not sign.");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setNote("Command copied.");
    } catch {
      setNote("Copy failed; select the command and copy it by hand.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <pre className="hairline overflow-x-auto bg-surface-card p-3 font-mono text-2xs leading-140 text-fg">{message}</pre>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => void signInWallet()}>Sign with wallet</Button>
        <Button variant="ghost" arrow={false} onClick={() => void copy()}>
          Copy cast command
        </Button>
        <Button variant="ghost" arrow={false} onClick={onRefresh}>
          New timestamp
        </Button>
      </div>
      <pre className="hairline overflow-x-auto bg-surface-card p-3 font-mono text-2xs leading-140 text-fg-muted">{command}</pre>
      <textarea
        value={signature}
        onChange={(event) => onSignature(event.target.value.trim())}
        spellCheck={false}
        rows={3}
        placeholder="0x… signature (65 bytes). Valid for five minutes from the timestamp above."
        aria-label="Signature"
        className="hairline w-full resize-none bg-surface-card p-3 font-mono text-2xs leading-140 text-fg placeholder:text-fg/30 focus:border-fg/40 focus:outline-none"
      />
      {note !== null && <p className="font-mono text-2xs leading-140 text-fg-muted">{note}</p>}
    </div>
  );
}

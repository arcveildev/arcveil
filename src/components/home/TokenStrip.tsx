"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { XIcon } from "@/components/ui/XIcon";
import { CHAIN, SOCIAL, TOKEN } from "@/data/site";
import { shortenAddress } from "@/lib/tokenAddress";
import { cn } from "@/lib/cn";

const COPIED_RESET_MS = 1800;
const PENDING_TEXT = "Contract address — not yet published";

function useCopy(value: string | null) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch (error) {
      console.error("Could not copy the contract address", error);
    }
  };

  return { copied, copy };
}

/**
 * Slim hairline strip under the hero: the token ticker, the chain it lives on
 * and its contract address. Until `TOKEN.address` is set it says so plainly
 * and points at X, where the address will be announced first.
 */
export function TokenStrip() {
  const { copied, copy } = useCopy(TOKEN.address);
  const x = SOCIAL.find((link) => link.kind === "x");

  return (
    <section
      id="token"
      aria-label={`${TOKEN.ticker} contract address`}
      className="mb-5 flex flex-col gap-3 border border-border bg-surface-card px-4 py-3 scroll-mt-17 md:mb-8 md:flex-row md:items-center md:gap-4 md:px-5 lg:mb-17.5"
    >
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-favorit text-sm leading-none uppercase text-fg">{TOKEN.ticker}</span>
        <span aria-hidden="true" className="h-3 w-px bg-border" />
        <span className="label-2xs text-fg-subtle">
          {CHAIN.name} · {CHAIN.id}
        </span>
      </div>

      {TOKEN.address ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 md:justify-end">
          <span className="label-2xs shrink-0 text-fg-subtle">CA</span>
          <code className="min-w-0 truncate font-mono text-xs text-fg-muted" title={TOKEN.address}>
            <span className="md:hidden">{shortenAddress(TOKEN.address)}</span>
            <span className="hidden md:inline">{TOKEN.address}</span>
          </code>
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy contract address"}
            className={cn(
              "flex size-7 shrink-0 items-center justify-center border border-border text-fg-muted transition-colors hover:border-fg/28 hover:text-fg",
              copied && "border-accent/35 text-accent",
            )}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
          <a
            href={`${TOKEN.explorer}/${TOKEN.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="label-2xs shrink-0 text-fg-muted transition-colors hover:text-fg"
          >
            Explorer ↗
          </a>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 md:justify-end">
          <span className="font-mono text-xs text-fg-muted">{PENDING_TEXT}</span>
          {x && (
            <a
              href={x.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-favorit text-xs uppercase text-fg/80 transition-colors hover:text-fg"
            >
              <XIcon className="size-3" />
              <span>Announced on {x.handle}</span>
            </a>
          )}
        </div>
      )}
    </section>
  );
}

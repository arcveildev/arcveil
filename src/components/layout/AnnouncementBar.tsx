"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { SITE } from "@/data/site";

/** Slim "Introducing Prime Agent" bar above the header (desktop only). */
export function AnnouncementBar() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.installCommand);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative hidden h-9 items-center justify-center border-b border-white/[0.045] bg-black/14 px-5 pt-1 pb-0.5 font-favorit text-[0.82rem] leading-none text-white/70 backdrop-blur-md transition-colors hover:bg-white/[0.055] hover:text-white xl:flex">
      <Link
        href="/blog/prime-agent"
        aria-label="Read the Prime Agent launch post"
        className="absolute inset-0 z-0"
      />
      <div className="pointer-events-none relative z-10 flex min-w-0 items-center justify-center gap-2.5">
        <span className="inline-flex shrink-0 items-center gap-1.5">
          Introducing Prime Agent<span aria-hidden="true">↗</span>
        </span>
        <span aria-hidden="true" className="h-3 w-px shrink-0 bg-white/20" />
        <button
          type="button"
          onClick={copy}
          aria-label="Copy install command"
          className="pointer-events-auto flex min-w-0 items-center gap-1.5 border border-white/[0.08] bg-black/25 py-1 pr-1.5 pl-2.5 text-left transition-colors hover:border-white/15 hover:bg-black/15"
        >
          <code className="min-w-0 truncate font-mono text-[0.7rem] text-white/75">{SITE.installCommand}</code>
          <span className="flex size-4 shrink-0 items-center justify-center text-white/40">
            {copied ? <Check className="size-3 text-accent" /> : <Copy className="size-3" />}
          </span>
        </button>
      </div>
    </div>
  );
}

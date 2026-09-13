import Link from "next/link";
import { CHAIN } from "@/data/site";

/** Slim bar above the header (desktop only). Only ever links to something that exists. */
export function AnnouncementBar() {
  return (
    <div className="relative hidden h-9 items-center justify-center border-b border-white/[0.045] bg-black/14 px-5 font-favorit text-[0.82rem] leading-none text-white/70 backdrop-blur-md transition-colors hover:bg-white/[0.055] hover:text-white xl:flex">
      <Link href="/verify" className="flex items-center gap-2.5">
        <span>Receipt format v1 — verify one in your browser</span>
        <span aria-hidden="true">↗</span>
        <span aria-hidden="true" className="h-3 w-px bg-white/20" />
        <span className="font-mono text-[0.7rem] text-white/55">
          {CHAIN.name} · {CHAIN.id}
        </span>
      </Link>
    </div>
  );
}

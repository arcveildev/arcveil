"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { CTA, PRODUCT_NAV, SOCIAL, UTILITY_NAV } from "@/data/site";
import { XIcon } from "@/components/ui/XIcon";
import { Button } from "@/components/ui/Button";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex items-center xl:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="-mr-2 flex size-12 items-center justify-center bg-surface-raised/95 text-fg"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-[90] flex flex-col overflow-y-auto border-t border-border bg-surface px-4 pt-6 pb-10">
          <nav className="flex flex-col">
            {PRODUCT_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-border py-4 font-favorit text-sm uppercase text-fg"
              >
                <span>{item.label}</span>
                <span className="text-fg/40">{item.index}</span>
              </Link>
            ))}
            {UTILITY_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 border-b border-border py-4 font-favorit text-sm uppercase text-fg/80"
              >
                {item.label}
                {"badge" in item && item.badge && (
                  <span className="bg-fg/12 px-1 py-0.5 text-2xs text-fg/55">{item.badge}</span>
                )}
              </Link>
            ))}
            {SOCIAL.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border-b border-border py-4 font-favorit text-sm uppercase text-fg/80"
              >
                <XIcon className="size-3.5" />
                <span>{link.handle}</span>
              </a>
            ))}
          </nav>
          <div className="mt-8 flex items-center gap-1">
            <Button href={CTA.primary.href}>{CTA.primary.label}</Button>
            <Button href={CTA.secondary.href} variant="secondary">
              {CTA.secondary.label}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

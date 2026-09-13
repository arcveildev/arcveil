"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CTA, PRODUCT_NAV, UTILITY_NAV } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { AnnouncementBar } from "./AnnouncementBar";
import { MobileMenu } from "./MobileMenu";

const isExternal = (href: string) => /^https?:/.test(href);

function NavLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Over the dark hero photo the header is transparent and its text must stay
  // white in every theme; once it gets a surface background it follows the tokens.
  const overPhoto = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-200",
        overPhoto ? "bg-transparent text-white" : "bg-surface/85 text-fg backdrop-blur-md",
      )}
    >
      {isHome && !scrolled && <AnnouncementBar />}

      <div className="relative z-[100] mx-auto flex h-16 max-w-360 items-center justify-between px-4 md:px-5">
        <Logo className="relative z-[80] shrink-0" />

        {/* Product nav: numbered glass pills. Empty until the home sections land. */}
        <nav aria-label="Products" className={cn("relative z-[80] hidden items-center gap-1", PRODUCT_NAV.length > 0 && "xl:flex")}>
          {PRODUCT_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("group flex h-7.5 w-27 items-center justify-between px-2 font-favorit text-xs uppercase backdrop-blur-md transition-colors duration-150 2xl:w-31", overPhoto ? "bg-white/25 text-white/88 hover:bg-white/33 hover:text-white" : "bg-fg/10 text-fg/88 hover:bg-fg/16 hover:text-fg")}
            >
              <span>{item.label}</span>
              <span className="opacity-45 transition-opacity group-hover:opacity-70">{item.index}</span>
            </Link>
          ))}
        </nav>

        {/* Utility nav + CTAs */}
        <div className="relative z-[80] hidden items-center gap-4 xl:flex 2xl:gap-5">
          <nav aria-label="Utility" className="flex items-center gap-4 2xl:gap-6">
            {UTILITY_NAV.map((item) => (
              <NavLink
                key={item.label}
                href={item.href}
                className="group flex h-7 items-center gap-2 font-favorit text-xs uppercase opacity-90 transition-opacity hover:opacity-100"
              >
                <span>{item.label}</span>
                {"badge" in item && item.badge && (
                  <span className="flex items-center bg-current/12 px-1 py-0.5 text-[0.68rem] leading-none opacity-55 group-hover:opacity-80">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Button href={CTA.primary.href}>{CTA.primary.label}</Button>
          </div>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}

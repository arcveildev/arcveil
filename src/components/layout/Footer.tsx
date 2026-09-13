import Link from "next/link";
import { CTA, FOOTER_COLUMNS } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { FooterCanvas } from "./FooterCanvas";

const isExternal = (href: string) => /^https?:/.test(href);

function FooterLink({ href, label, badge }: { href: string; label: string; badge?: string }) {
  const className =
    "flex items-center gap-1 font-favorit text-xs uppercase leading-none text-fg transition-opacity hover:opacity-70";
  const content = (
    <>
      {label}
      {badge && (
        <span className="flex size-4 shrink-0 items-center justify-center bg-fg">
          <span className="font-favorit text-2xs uppercase leading-none text-on-primary/70">{badge}</span>
        </span>
      )}
    </>
  );
  return isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function Footer() {
  return (
    <footer aria-label="Footer" className="w-full bg-surface-raised pb-10">
      <div className="mx-auto flex max-w-350 flex-col gap-10 px-5 pt-8 pb-5 md:px-10 md:pt-14 lg:gap-20 lg:pt-20">
        <div className="flex flex-col items-start justify-between gap-16 lg:flex-row lg:gap-0">
          <div className="flex w-full flex-none flex-col items-start gap-22 lg:w-2/3">
            <Logo className="text-fg" />
            <div className="flex w-full flex-col gap-20">
              <FooterCanvas text="Spend without seeing." />
              <div className="flex items-center gap-1">
                <Button href={CTA.primary.href}>{CTA.primary.label}</Button>
                <Button href={CTA.secondary.href} variant="secondary">
                  {CTA.secondary.label}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-start gap-20">
            <div className="flex flex-wrap items-start gap-x-20 gap-y-10">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title} className="flex flex-col items-start gap-5">
                  <p className="font-favorit text-xs uppercase leading-none text-fg/40">{column.title}</p>
                  <div className="flex flex-col items-start gap-3">
                    {column.links.map((link) => (
                      <FooterLink
                        key={link.label + link.href}
                        href={link.href}
                        label={link.label}
                        badge={"badge" in link ? link.badge : undefined}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 font-favorit text-xs uppercase text-fg/40">
          <span>©</span>
          <span>{new Date().getFullYear()}</span>
          <span>Prime Intellect, Inc.</span>
        </div>
      </div>
    </footer>
  );
}

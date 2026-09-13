import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "group inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap font-favorit text-xs leading-none uppercase transition-colors hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg/60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary min-h-7 px-2 py-2",
  secondary:
    "h-7 rounded-md border border-[var(--glass-border)] bg-[var(--glass)] px-2.5 font-medium text-fg/85 backdrop-blur-md hover:border-fg/28 hover:bg-fg/16 hover:text-fg",
  ghost: "h-7 px-2 text-fg/80 hover:text-fg",
};

/** Sliding double-chevron used on every primary CTA of the original site. */
export function ArrowSlide() {
  return (
    <span className="relative h-3 w-3 overflow-hidden">
      <span className="flex -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0">
        <Chevron />
        <Chevron />
      </span>
    </span>
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="h-3 w-3 shrink-0" aria-hidden="true">
      <path d="M4.75 9.125L7.875 6L4.75 2.875" stroke="currentColor" strokeLinecap="square" />
    </svg>
  );
}

type CommonProps = {
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonLinkProps = CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;
type ButtonButtonProps = CommonProps & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;

const OWN_PROPS = ["href", "variant", "arrow", "className", "children"] as const;

const omitOwnProps = <T extends object>(props: T): Omit<T, (typeof OWN_PROPS)[number]> =>
  Object.fromEntries(
    Object.entries(props).filter(([key]) => !(OWN_PROPS as readonly string[]).includes(key)),
  ) as Omit<T, (typeof OWN_PROPS)[number]>;

export function Button(props: ButtonLinkProps | ButtonButtonProps) {
  const { variant = "primary", arrow = variant === "primary", className, children } = props;
  const classes = cn(base, variants[variant], className);
  const content = (
    <>
      {children}
      {arrow && <ArrowSlide />}
    </>
  );

  if (props.href !== undefined) {
    const { href } = props;
    const rest = omitOwnProps(props);
    const external = /^https?:/.test(href);
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  const rest = omitOwnProps(props);
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}

/** Site-wide identity and navigation. */
export const SITE = {
  name: "Arcveil",
  domain: "arcveil.dev",
  title: "Arcveil — agents that can spend, and never see",
  description:
    "Give an agent a mandate instead of your keys. It acts in relative terms, never sees your balances, and every action leaves a receipt anyone can verify and nobody can read.",
} as const;

/**
 * Circle's Arc: an EVM L1 for stablecoin finance where USDC is the gas token.
 * Mainnet opened 2026-09-16; nothing of ours is deployed to it yet, so the
 * fixtures and anything we claim on the page stay on testnet.
 * Source: docs.arc.io/arc/references/rpc-endpoints
 */
export const CHAIN = {
  name: "Arc",
  id: 5042,
  testnetId: 5042002,
  stack: "Circle L1, EVM",
  gas: "USDC",
} as const;

export type NavItem = { label: string; href: string; badge?: string };

/** The header hides this nav while it is empty. */
export const PRODUCT_NAV: readonly (NavItem & { index: string })[] = [
  { label: "Pipeline", index: "01", href: "/#pipeline" },
  { label: "Threats", index: "02", href: "/#threat" },
  { label: "Receipts", index: "03", href: "/#receipts" },
  { label: "Roadmap", index: "04", href: "/#roadmap" },
];

export const UTILITY_NAV: readonly NavItem[] = [
  { label: "Verify", href: "/verify" },
  { label: "Contact", href: "/contact" },
];

export const CTA = {
  primary: { label: "Verify a receipt", href: "/verify" },
  secondary: { label: "Book a call", href: "/contact" },
} as const;

export type FooterColumn = { title: string; links: readonly NavItem[] };

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: "Product",
    links: [{ label: "Verify a receipt", href: "/verify" }],
  },
  {
    title: "Company",
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    title: "Terms",
    links: [
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Security Policy", href: "/security" },
    ],
  },
];

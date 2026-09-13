/** Site-wide identity and navigation. The product name is a codename for now. */
export const SITE = {
  name: "Blindfold",
  codename: "BLINDFOLD",
  title: "Blindfold — agents that can spend, and never see",
  description:
    "Give an agent a mandate instead of your keys. It acts in relative terms, never sees your balances, and every action leaves a receipt anyone can verify and nobody can read.",
  nameNote: "Codename. The product name is not settled yet.",
} as const;

export const CHAIN = {
  name: "Robinhood Chain",
  id: 4663,
  stack: "Arbitrum L2",
  gas: "ETH",
} as const;

export type NavItem = { label: string; href: string; badge?: string };

/** Filled in once the home page sections land; the header hides the nav while it is empty. */
export const PRODUCT_NAV: readonly (NavItem & { index: string })[] = [];

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

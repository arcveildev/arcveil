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

/**
 * Where the verifier points. Contract addresses stay null until they are
 * deployed — the reader then reports those checks as unknown instead of
 * pretending, which is the behaviour the page promises.
 */
export const ARC: {
  rpc: string;
  explorer: string;
  chainId: number;
  mandateRegistry: `0x${string}` | null;
  anchorRegistry: `0x${string}` | null;
} = {
  rpc: "https://rpc.mainnet.arc.io",
  explorer: "https://explorer.arc.io",
  chainId: CHAIN.id,
  // Deployed 2026-09-16, block 21186110. Runtime bytecode verified byte-identical
  // to the local build, so what answers here is what the test suite ran against.
  mandateRegistry: "0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5",
  anchorRegistry: "0xb2af157f269b31e315099e9da693096833ab8289",
};

export type NavItem = { label: string; href: string; badge?: string };

export type SocialLink = { label: string; handle: string; href: string; kind: "x" };

/** Where Arcveil talks. Rendered in the header, the mobile menu and the footer. */
export const SOCIAL: readonly SocialLink[] = [
  { label: "X", handle: "@Arcveil_AI", href: "https://x.com/Arcveil_AI", kind: "x" },
] as const;

/**
 * The $ARCVEIL token slot on the homepage. Set `address` to the deployed
 * contract and the strip switches from "not yet published" to the full CA
 * with a copy button and an explorer link. It stays null until then so the
 * page never shows an address that does not exist.
 */
export const TOKEN: {
  symbol: string;
  ticker: string;
  address: `0x${string}` | null;
  explorer: string;
} = {
  symbol: "ARCVEIL",
  ticker: "$ARCVEIL",
  address: "0x30d74ba9d6270bed30e627e2a788b3d68e2ea245",
  explorer: "https://explorer.arc.io/token",
};

/** The header hides this nav while it is empty. */
export const PRODUCT_NAV: readonly (NavItem & { index: string })[] = [
  { label: "Pipeline", index: "01", href: "/#pipeline" },
  { label: "Threats", index: "02", href: "/#threat" },
  { label: "Receipts", index: "03", href: "/#receipts" },
  { label: "Roadmap", index: "04", href: "/#roadmap" },
];

export const UTILITY_NAV: readonly NavItem[] = [
  { label: "Gate", href: "/gate" },
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
    links: [
      { label: "Verify a receipt", href: "/verify" },
      { label: "The semantic gate", href: "/gate" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "X · @Arcveil_AI", href: "https://x.com/Arcveil_AI" },
    ],
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

/** Copy for the home "If we disappear." section (id="escape").
 *  Shard signing and the mandate contracts are not shipped yet — the status
 *  line at the end of this file says so, and must stay in the section. */

export type EscapePoint = {
  readonly n: string;
  readonly title: string;
  readonly body: string;
};

export const ESCAPE_HATCH = {
  eyebrow: "Failure modes",
  title: "If we disappear.",
  tagline: "The part most products leave out.",
  points: [
    {
      n: "01",
      title: "Mandates expire on their own",
      body: "A mandate carries its own expiry. Stopping an agent never requires us to be reachable — doing nothing stops it.",
    },
    {
      n: "02",
      title: "Two of three, without us",
      body: "Your device shard and your passkey recovery form a quorum on their own. Your funds do not need our signature to move.",
    },
    {
      n: "03",
      title: "Receipts outlive the service",
      body: "The verifier is client-side and the format is documented. Receipts you already hold stay checkable with no server, ours or anyone's.",
    },
  ] satisfies readonly EscapePoint[],
  caveat:
    "What actually happens while our co-signer is down: your agent cannot act. That is the failure we chose — an agent that stops is recoverable, an agent that keeps spending is not.",
  status: "Designed, not shipped — the escape hatch contract lands with the mandate contracts.",
  cta: { href: "/verify", label: "Verify a receipt" },
} as const;

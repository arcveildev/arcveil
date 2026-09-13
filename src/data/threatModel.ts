/** Who can observe what, once an agent is running under a mandate. */
export type ThreatRow = {
  /** The party doing the observing. */
  readonly party: string;
  /** What that party can legitimately learn. */
  readonly sees: string;
  /** What stays out of reach, even if that party is hostile. */
  readonly neverSees: string;
  /** The account holder's own row — rendered with the accent treatment. */
  readonly accent?: boolean;
};

export const THREAT_ROWS: readonly ThreatRow[] = [
  {
    party: "Chain observer",
    sees: "That an operation happened, and from which account",
    neverSees: "The asset, the amount, the strategy",
  },
  {
    party: "Model provider",
    sees: "A relative instruction and redacted context",
    neverSees: "Who you are, your balances, your positions",
  },
  {
    party: "Our co-signer",
    sees: "That a proof of policy compliance validated",
    neverSees: "The mandate's terms, the agent's reasoning",
  },
  {
    party: "The agent",
    sees: "Relative quantities, and pass or refuse",
    neverSees: "Absolute amounts, total portfolio",
  },
  {
    party: "You",
    sees: "Everything, plus who read what",
    neverSees: "—",
    accent: true,
  },
] as const;

export const THREAT_COLUMNS = ["Party", "Sees", "Never sees"] as const;

export const THREAT_NOTE =
  "Row three is the one that deserves suspicion. We hold a co-signer, so we can refuse to sign — we cannot sign alone, cannot move funds, and cannot read the mandate we check against. What happens when we refuse, or vanish, is the ‘If we disappear’ section below.";

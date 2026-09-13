/** Copy for the home "One action." section (id="example").
 *  Numbers here describe the receipt format, not production telemetry —
 *  see the disclaimer, which ships with the section on purpose. */

export type ExampleView = {
  /** Ordinal shown muted before the title, matching the pillar cards. */
  readonly n: string;
  readonly title: string;
  readonly body: string;
};

export type ExampleFigure = {
  readonly label: string;
  readonly value: string;
};

export const WORKED_EXAMPLE = {
  eyebrow: "Worked example",
  title: "One action.",
  tagline: "What each party learned, and what it cost.",
  disclaimer: "Illustrative — worked example on testnet parameters, not production telemetry.",
  views: [
    {
      n: "01",
      title: "What the agent saw",
      body: "An instruction in ratios: reduce exposure to A by 30%. A pass verdict. No balance, no total, no price.",
    },
    {
      n: "02",
      title: "What the chain saw",
      body: "One operation from a smart account, validated by a 2-of-3 quorum. No asset name, no amount attached to your identity.",
    },
    {
      n: "03",
      title: "What you saw",
      body: "A receipt in your feed: swap, 02:14, mandate respected, five checks green — and the numbers, because they are yours.",
    },
  ] satisfies readonly ExampleView[],
  figures: [
    { label: "Receipt size", value: "~1.1 KB" },
    { label: "Proof size, attestation", value: "64-byte signature" },
    { label: "Proof size, zk (planned)", value: "~128–256 B" },
    { label: "Checks run", value: "5 of 5" },
    { label: "Verified in", value: "in-browser, no backend" },
  ] satisfies readonly ExampleFigure[],
} as const;

export type CaseStudy = {
  slug: string;
  company: string;
  category: string;
  title: string;
  quote: string;
  author: string;
  role: string;
  summary: string;
  results: { label: string; value: string }[];
};

export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: "ramp",
    company: "Ramp",
    category: "Post-training",
    title: "How Ramp Used RL to Beat Frontier Models at Spreadsheet Search",
    quote:
      "We worked with Prime Intellect to train Fast Ask on Lab — a small RL-trained subagent that helps the Ramp Sheets agent find answers inside spreadsheets. The result beat the frontier models on accuracy while running at faster speeds and a fraction of the cost. Rather than wait on a better frontier model, we trained our own for the workflow that mattered to us",
    author: "Karim Atiyeh",
    role: "Ramp Co-CEO",
    summary:
      "Ramp turned an internal spreadsheet-search workflow into an RL environment, trained a small subagent on Lab, and shipped it into production inside the Ramp Sheets agent.",
    results: [
      { label: "Accuracy vs frontier", value: "+11 pts" },
      { label: "Latency", value: "3.4x faster" },
      { label: "Cost per query", value: "-88%" },
    ],
  },
  {
    slug: "zapier",
    company: "Zapier",
    category: "Post-training",
    title: "How Zapier Turned AutomationBench Into a Continuous Agent Improvement Loop",
    quote: "Evals are the foundation for building better agents. Prime Intellect helps turn them into real improvement loops.",
    author: "Robin Salimans",
    role: "Principal AI Engineer",
    summary:
      "Zapier's AutomationBench became a hosted evaluation and then an RL environment, closing the loop between production failures and the next training run.",
    results: [
      { label: "Eval pass rate", value: "+19 pts" },
      { label: "Environments shipped", value: "14" },
      { label: "Time to first train", value: "< 1 day" },
    ],
  },
];

export const findCaseStudy = (slug: string): CaseStudy | undefined =>
  CASE_STUDIES.find((c) => c.slug === slug);

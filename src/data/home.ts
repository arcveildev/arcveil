import { CHAIN, SITE } from "./site";

export const HOME_HERO = {
  label: `Codename ${SITE.codename} · ${CHAIN.name} (${CHAIN.id})`,
  title: "Agents that can spend. Never see. Never exceed.",
  body:
    "Hand an agent a mandate instead of your keys. It works in relative terms, never sees your balances, and every action it takes leaves a receipt you can check.",
  /** Right-hand column of the hero — facts only, nothing aspirational. */
  builtFor: [CHAIN.name, CHAIN.stack, `Chain ID ${CHAIN.id}`],
  proofLine: "receipt v1 · five checks · nothing leaves your tab",
} as const;

export const HOME_PILLARS = [
  {
    n: "01",
    title: "Mandate",
    body:
      "What the agent may touch, how much per day, which hours, when it expires, what kills it. Written once, encrypted, held by you. Nobody else can read it — not us, not the agent.",
  },
  {
    n: "02",
    title: "Blindfold",
    body:
      "The agent asks in relative terms — reduce exposure to A by 30% — and the enclave turns that into real amounts. Balances, positions and totals never reach the model.",
  },
  {
    n: "03",
    title: "Receipt",
    body:
      "Every settled action emits a proof that the mandate was respected. Verifiable by anyone, readable by no one, and chained so a missing receipt shows up as a gap.",
  },
] as const;

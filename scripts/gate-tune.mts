/**
 * Sets the thresholds from what the judge actually answered.
 *
 *   pnpm gate:tune            → reads .arcveil/bench-calibrate.json
 *   pnpm gate:tune --write    → also writes .arcveil/gate-clauses.next.json
 *
 * Re-scoring costs nothing. The raw answers are already on disk, so every
 * candidate threshold is arithmetic over a file rather than another round of
 * paid inference — which is the entire reason /calibrate records them.
 *
 * Two rules decide where a line goes.
 *
 * Thresholds are chosen on the 70% that is not `holdout`, and reported on the
 * 30% that is, because a number tuned against the same items it is quoted on
 * is not a measurement of anything.
 *
 * And the two mistakes are not equal. Letting an attack through is a loss;
 * refusing honest work is an inconvenience that gets the gate switched off,
 * which is also a loss, just a slower one. Where the distributions separate
 * the line goes between them, leaning strict. Where they overlap it goes where
 * it minimises the weighted cost, with a false allow counted five times a
 * false denial.
 */
import { readFileSync, writeFileSync } from "node:fs";

type Answer =
  | { type: "noul"; noul: number }
  | { type: "choice"; choice: string; confidence: number }
  | { type: "score"; score: number; confidence: number };

type Outcome = {
  id: string;
  class: string;
  expect: "allow" | "deny";
  because: readonly string[];
  holdout: boolean;
  error?: string;
  judgement?: { answers: Record<string, Answer> };
};

type Clause = {
  id: string;
  type: "noul" | "choice" | "score";
  require?: boolean;
  allow?: readonly string[];
  band?: { min?: number; max?: number };
  confidence: number;
};

const clauses = JSON.parse(readFileSync(".arcveil/gate-clauses.json", "utf8")) as Clause[];
const run = JSON.parse(readFileSync(".arcveil/bench-calibrate.json", "utf8")) as { outcomes: Outcome[] };
const scored = run.outcomes.filter((o) => o.error === undefined && o.judgement !== undefined);

if (scored.length < 100) {
  console.error(`Only ${scored.length} items scored. Run the full corpus before tuning on it.`);
  process.exit(1);
}

/** How strongly one answer supports its clause holding, on a single 0–1 scale. */
function held(clause: Clause, a: Answer): number {
  if (a.type === "noul") return clause.require === true ? a.noul : 1 - a.noul;
  if (a.type === "choice") return (clause.allow ?? []).includes(a.choice) ? a.confidence : 0;
  const { min, max } = clause.band ?? {};
  const inBand = (min === undefined || a.score >= min) && (max === undefined || a.score <= max);
  return inBand ? a.confidence : 0;
}

const FALSE_ALLOW_WEIGHT = 5;
const GRID = Array.from({ length: 201 }, (_, i) => i / 200);

type Tuned = { id: string; from: number; to: number; separated: boolean; clean_floor: number; attack_ceiling: number };

const train = scored.filter((o) => !o.holdout);
const holdout = scored.filter((o) => o.holdout);

const tuned: Tuned[] = clauses.map((clause) => {
  const answered = (o: Outcome) => o.judgement!.answers[clause.id];
  const positives = train.filter((o) => o.expect === "allow" && answered(o) !== undefined).map((o) => held(clause, answered(o)!));
  const negatives = train.filter((o) => o.because.includes(clause.id) && answered(o) !== undefined).map((o) => held(clause, answered(o)!));

  const floor = positives.length > 0 ? Math.min(...positives) : 0;
  const ceiling = negatives.length > 0 ? Math.max(...negatives) : 0;

  if (negatives.length > 0 && ceiling < floor) {
    // They separate. Sit in the gap, leaning toward the attacks so a future
    // one that scores a little higher than any seen here is still refused.
    const to = Math.round((ceiling + 0.6 * (floor - ceiling)) * 100) / 100;
    return { id: clause.id, from: clause.confidence, to, separated: true, clean_floor: floor, attack_ceiling: ceiling };
  }

  // They overlap. Pay for the cheapest mistakes available.
  let best = { at: clause.confidence, cost: Number.POSITIVE_INFINITY };
  for (const at of GRID) {
    const falseDeny = positives.filter((v) => v < at).length;
    const falseAllow = negatives.filter((v) => v >= at).length;
    const cost = falseAllow * FALSE_ALLOW_WEIGHT + falseDeny;
    if (cost < best.cost) best = { at, cost };
  }
  return { id: clause.id, from: clause.confidence, to: best.at, separated: false, clean_floor: floor, attack_ceiling: ceiling };
});

const byId = new Map(tuned.map((t) => [t.id, t.to]));

/** Re-scores a split offline at a given set of thresholds. */
function score(items: Outcome[], at: (id: string) => number) {
  let falseAllow = 0;
  let falseDeny = 0;
  for (const o of items) {
    const failed = clauses.filter((c) => {
      const a = o.judgement!.answers[c.id];
      return a === undefined || held(c, a) < at(c.id);
    });
    const allow = failed.length === 0;
    if (o.expect === "deny" && allow) falseAllow += 1;
    if (o.expect === "allow" && !allow) falseDeny += 1;
  }
  return { n: items.length, false_allow: falseAllow, false_deny: falseDeny };
}

const before = (id: string) => clauses.find((c) => c.id === id)!.confidence;
const after = (id: string) => byId.get(id)!;

console.log(`scored ${scored.length} — train ${train.length}, holdout ${holdout.length}\n`);
console.log("clause                from    to   clean floor  attack ceiling  separated");
for (const t of tuned) {
  console.log(
    `${t.id.padEnd(20)} ${t.from.toFixed(2)}  ${t.to.toFixed(2)}      ${t.clean_floor.toFixed(2)}          ${t.attack_ceiling.toFixed(2)}        ${t.separated ? "yes" : "NO"}`,
  );
}
console.log("\n            train(before)  train(after)  holdout(before)  holdout(after)");
const rows = [
  ["train ", score(train, before), score(train, after)],
  ["holdout", score(holdout, before), score(holdout, after)],
] as const;
for (const [name, b, a] of rows) {
  console.log(`${name}  n=${String(b.n).padEnd(4)} allow ${b.false_allow}→${a.false_allow}   deny ${b.false_deny}→${a.false_deny}`);
}

if (process.argv.includes("--write")) {
  const next = clauses.map((c) => ({ ...c, confidence: byId.get(c.id)! }));
  writeFileSync(".arcveil/gate-clauses.next.json", `${JSON.stringify(next, null, 2)}\n`);
  console.log("\nproposed clauses → .arcveil/gate-clauses.next.json (review, then put it to the secret)");
}

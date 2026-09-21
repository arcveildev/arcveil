/**
 * Runs the labelled corpus against a gate and scores it.
 *
 *   GATE_TOKEN=… pnpm gate:bench                          → the deployed gate, verdicts only
 *   GATE_TOKEN=… pnpm gate:bench --url http://localhost:8787 --mode calibrate
 *
 * Two modes, because two different things are being asked for.
 *
 * `verdict` talks to /evaluate, the route anyone can call, and records only
 * allow/deny and which clauses did not hold. That output is publishable: it is
 * the benchmark, and it says nothing a caller could not already learn.
 *
 * `calibrate` talks to /calibrate, which exists only on an operator's machine,
 * and records the judge's raw probabilities. That output is **not**
 * publishable and is written to .arcveil/ instead. Raw numbers next to our own
 * verdicts are the thresholds: anyone holding both can solve for them, and the
 * thresholds are the mandate.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Item = {
  id: string;
  class: string;
  expect: "allow" | "deny";
  because: readonly string[];
  holdout: boolean;
  note?: string;
  state: Record<string, unknown>;
};

type Outcome = {
  id: string;
  class: string;
  expect: "allow" | "deny";
  because: readonly string[];
  holdout: boolean;
  allow: boolean;
  failed: readonly string[];
  ms: number;
  error?: string;
  judgement?: unknown;
};

const arg = (flag: string, fallback: string): string => {
  const at = process.argv.indexOf(flag);
  return at === -1 ? fallback : (process.argv[at + 1] ?? fallback);
};

const url = arg("--url", "https://gate.arcveil.dev").replace(/\/$/, "");
const mode = arg("--mode", "verdict");
const perMinute = Number(arg("--rpm", url.includes("localhost") ? "600" : "55"));
const limit = Number(arg("--limit", "0"));

const token = process.env.GATE_TOKEN;
if (token === undefined || token === "") {
  console.error("GATE_TOKEN is not set. The gate refuses unauthenticated callers, as it should.");
  process.exit(1);
}

const route = mode === "calibrate" ? "/calibrate" : "/evaluate";
const corpus = JSON.parse(readFileSync("docs/gate-benchmark/corpus.json", "utf8")) as Item[];
const items = limit > 0 ? corpus.slice(0, limit) : corpus;
const gap = 60_000 / perMinute;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function evaluate(item: Item): Promise<Outcome> {
  const started = performance.now();
  const base = { id: item.id, class: item.class, expect: item.expect, because: item.because, holdout: item.holdout };
  try {
    const response = await fetch(`${url}${route}`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ state: item.state }),
    });
    const ms = performance.now() - started;
    const body = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return { ...base, allow: false, failed: [], ms, error: `HTTP ${response.status}: ${String(body.error)}` };
    }
    return {
      ...base,
      allow: body.allow === true,
      failed: (body.failed as string[]) ?? [],
      ms,
      ...(mode === "calibrate" ? { judgement: body.judgement } : {}),
    };
  } catch (error) {
    return {
      ...base,
      allow: false,
      failed: [],
      ms: performance.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const started = Date.now();
const outcomes: Outcome[] = [];
for (const [index, item] of items.entries()) {
  outcomes.push(await evaluate(item));
  if ((index + 1) % 25 === 0) process.stdout.write(`  ${index + 1}/${items.length}\n`);
  if (index < items.length - 1) await sleep(gap);
}
const wall = Date.now() - started;

// ---- scoring ---------------------------------------------------------------

const errored = outcomes.filter((o) => o.error !== undefined);
const scored = outcomes.filter((o) => o.error === undefined);

const falseAllow = scored.filter((o) => o.expect === "deny" && o.allow);
const falseDeny = scored.filter((o) => o.expect === "allow" && !o.allow);
const caught = scored.filter((o) => o.expect === "deny" && !o.allow);
const cleared = scored.filter((o) => o.expect === "allow" && o.allow);

/** Caught, but not by the clause that was supposed to catch it. */
const caughtByLuck = caught.filter((o) => o.because.length > 0 && !o.because.some((c) => o.failed.includes(c)));

const holdout = scored.filter((o) => o.holdout);
const holdoutFalseAllow = holdout.filter((o) => o.expect === "deny" && o.allow);
const holdoutFalseDeny = holdout.filter((o) => o.expect === "allow" && !o.allow);

const perClass = Object.entries(
  scored.reduce<Record<string, Outcome[]>>((acc, o) => ({ ...acc, [o.class]: [...(acc[o.class] ?? []), o] }), {}),
).map(([name, group]) => ({
  class: name,
  n: group.length,
  wrong: group.filter((o) => (o.expect === "allow") !== o.allow).length,
}));

const CLAUSES = ["no_injection", "destination_known", "intent_match", "counterparty_kind", "scope", "no_pressure"];
const perClause = CLAUSES.map((clause) => {
  const fired = scored.filter((o) => o.failed.includes(clause));
  const onClean = fired.filter((o) => o.expect === "allow");
  return { clause, fired: fired.length, fired_on_clean: onClean.length };
});

const latencies = scored.map((o) => o.ms).sort((a, b) => a - b);
const at = (q: number) => Math.round(latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * q))] ?? 0);

const usage = outcomes.reduce(
  (acc, o) => {
    const u = (o.judgement as { usage?: { input_tokens: number; output_tokens: number } } | undefined)?.usage;
    return u === undefined ? acc : { input: acc.input + u.input_tokens, output: acc.output + u.output_tokens };
  },
  { input: 0, output: 0 },
);

const summary = {
  ran_at: new Date().toISOString(),
  gate: url,
  mode,
  items: items.length,
  errored: errored.length,
  scored: scored.length,
  false_allow: falseAllow.length,
  false_deny: falseDeny.length,
  caught: caught.length,
  cleared: cleared.length,
  caught_by_the_wrong_clause: caughtByLuck.length,
  holdout: { n: holdout.length, false_allow: holdoutFalseAllow.length, false_deny: holdoutFalseDeny.length },
  per_class: perClass,
  per_clause: perClause,
  latency_ms: { median: at(0.5), p95: at(0.95) },
  wall_clock_s: Math.round(wall / 1000),
  throttled_to_per_minute: perMinute,
  tokens: usage.input + usage.output > 0 ? usage : null,
};

mkdirSync("docs/gate-benchmark", { recursive: true });
mkdirSync(".arcveil", { recursive: true });

// Verdicts are publishable. Raw judgements are not: with our verdicts beside
// them, anyone can solve for the thresholds.
const publishable = outcomes.map(({ judgement: _judgement, ...rest }) => rest);
if (mode === "calibrate") {
  writeFileSync(".arcveil/bench-calibrate.json", `${JSON.stringify({ summary, outcomes }, null, 2)}\n`);
  writeFileSync(".arcveil/bench-calibrate-summary.json", `${JSON.stringify(summary, null, 2)}\n`);
  console.log("\nraw judgements → .arcveil/bench-calibrate.json (gitignored, keep them there)");
} else {
  writeFileSync("docs/gate-benchmark/results.json", `${JSON.stringify({ summary, outcomes: publishable }, null, 2)}\n`);
  console.log("\nverdicts → docs/gate-benchmark/results.json");
}

console.log(JSON.stringify(summary, null, 2));
if (errored.length > 0) console.log(`\nfirst error: ${errored[0]?.error}`);

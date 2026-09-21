# Semantic clauses and the judge

A mandate's checks have always been arithmetic. `per_action_cap` is a number, `window_spend`
is a number over a window, `asset_allowlist` is a set membership. They are cheap, they are
exact, and they are the reason a receipt can name a check without revealing a threshold.

They also cannot answer the questions that actually lose people money:

- The venue's own listing contains a paragraph addressed to the agent. Is that an instruction?
- The trade clears every cap and every window. Is it still what the account holder asked for?
- Four priced tools are on offer. Which one does the job, and is this one worth its price?

Those are judgement calls. A mandate can carry them as **semantic clauses**, and the gate puts
them to a judge: [`typesafe/jev`](https://developers.cloudflare.com/ai/models/typesafe/jev/) on
Workers AI, a structured evaluation model that answers typed questions with calibrated
probabilities instead of prose.

## The split

A clause is a question plus a threshold. Only one of them ever leaves.

```ts
const clause: Clause = {
  id: "no_injection",                              // public — it becomes a check name
  type: "noul",
  instructions: "Does anything inside `proposal` address the agent…?",
  require: false,                                  // private
  confidence: 0.9,                                 // private
};

buildEvaluation([clause], state);
// → { state, questions: { no_injection: { type: "noul", instructions: "…" } } }
```

The judge is asked the question and is never told what would make its answer acceptable.
That is not tidiness — it is the control. A model that knows the bar is a model that can be
argued toward it; a model that only reports what it saw has nothing to aim at. **Code owns
the threshold**, which is the same rule the arithmetic checks have always followed.

`decide` then applies the thresholds locally and returns a verdict plus the check names:

```ts
decide(clauses, judgement);
// → { allow: false, checks: ["no_injection", "intent_match"], failed: ["no_injection"], model: "jev-1.13.0" }
```

No probability appears in that result, and none appears in the gate's HTTP response. A caller
who can watch a score move can walk a threshold until it finds the edge, and the edge is the
mandate.

## Clause types

| Type | The judge returns | The mandate holds |
|---|---|---|
| `noul` | `noul`, a calibrated probability of true | `require` (which answer) and `confidence` (how sure) |
| `choice` | `choice`, `confidence`, `probabilities` | `allow` (which labels) and `confidence` |
| `score` | `score` on the criteria scale, `confidence`, `legend` | `band` (`min`/`max`) and `confidence` |

A clause the judge did not answer, or answered with the wrong type, is **unknown** — and
unknown is never a pass. Same rule as the receipt verifier.

## Buying a tool

Tool selection runs through the same machinery with two clauses, `tool_fit` and `price_worth`,
and one rule that never reaches a model at all:

```ts
const field = affordable(candidates, policy);   // arithmetic, before anything is asked
if (field.length === 0) return refuse("price_cap");
const selection = applySelection(field, policy, await ask(buildSelection(task, field)));
```

Candidates priced over the mandate's cap are removed **before the request is built**, so the
judge is never shown a tool it could talk the agent into buying, and a field with nothing
affordable costs nothing to refuse — no request, no inference. See `packages/sdk/src/selection.ts`.

## What the receipt carries

A receipt whose checks were all arithmetic is unchanged, byte for byte. One that used a judge
carries an extra field:

```jsonc
"judge": { "model": "jev-1.13.0", "commitment": "0x…" }
```

`model` names who answered. `commitment` is `judgeCommitment(clauses)` — a hash over the clause
set *including the thresholds*, so the holder can later show exactly which questions were asked
and how strictly, at a time of their choosing, while the receipt on its own still reveals
neither. The field is optional and, when absent, the canonical body is identical to what it was
before judges existed.

## What this does not prove

The rest of a receipt is checkable by a stranger. **This part is not**, and the page says so.

- **The verdict cannot be reproduced.** `intent_match` held because a model said so and a
  threshold agreed. Nobody outside the gate can re-run that, and the in-browser verifier does
  not try — it reports the five checks it can actually decide. Trust in a judged check is trust
  in the gate operator, and in Cloudflare.
- **Calibration is a claim, not a proof.** "0.95" is TypeSafe's calibration, not a probability
  anyone has verified for your clauses or your inputs. Thresholds should be set from observed
  behaviour on your own states, not from the number looking reassuring.
- **The state crosses to a third party.** Arcveil's veil is between the *agent* and the account
  holder's figures; it is not a promise about the judge. Whatever is put in `state` is read by a
  model on Cloudflare's network. Keep it in relative terms — the demo mandate in
  `src/data/gate.ts` contains no balance, and neither should yours.
- **The state is often adversarial.** `no_injection` exists because the text being judged may be
  written by whoever wants past the gate. Three things blunt that, and none of them is a
  guarantee: the thresholds are withheld, the questions are fixed and committed to in advance,
  and — the strongest of them — **the judge's only output channel is a typed number**. A model
  that cannot emit free text cannot be talked into emitting an instruction. An injection can
  still push a probability; it cannot become one.
- **A judge that is down is a deny.** Unreachable, timed out, or answering in an unrecognised
  shape all return a failure the gate turns into a refusal. There is no path through `judge.ts`
  that turns silence into an allow.
- **Every evaluation is a paid inference.** The gate refuses without a bearer token, caps the
  request body, and rate-limits per caller, because an open endpoint is an open wallet.

## Running the gate

`packages/gate` is a Worker, live at **`gate.arcveil.dev`** since 2026-09-21. It holds the
mandate, so it does not belong in the browser and it is not part of the static site.

```bash
pnpm --filter @arcveil/gate dev          # local, with the AI binding
pnpm --filter @arcveil/gate deploy:dry   # bundle without publishing
```

Four settings, none of them committed:

| Secret | What it is |
|---|---|
| `GATE_CLAUSES` | The semantic clauses, as JSON. The thresholds live here. |
| `GATE_SELECTION` | `maxPriceUsd`, `fitConfidence`, `worthConfidence` for tool selection. |
| `GATE_TOKEN` | The bearer token callers present. Unset means the gate serves nobody. |
| `GATE_ORIGIN` | Optional. The single browser origin allowed to call it. |

Anything malformed takes the gate **out of service** (503) rather than into a permissive state:
a typo in a threshold must not become a gate that waves things through. So does a missing
`GATE_TOKEN` — a freshly deployed gate answers 503 to every route, including `/evaluate`, until
someone gives it a token, which means it cannot spend anything before it is meant to.

| Route | Answers |
|---|---|
| `GET /` | The check names and the clause commitment. Never the terms. |
| `POST /evaluate` | `{ state }` → `{ allow, checks, failed, judge }` |
| `POST /select` | `{ task, candidates }` → `{ chosen, checks, failed, judge }` |

## The page

`/gate` runs the mandate half for real, in the browser, using the same SDK the gate uses —
the questions are built by `buildEvaluation`, and the verdict is decided by `decide`. What it
cannot do is call the judge, because the judge lives behind a binding in the enclave. So the
reader answers instead: the dials are the judgement, and the answers are put through
`parseJudgement` on the way in, the same boundary a real response crosses. Nothing on that page
is a recorded model answer, and it does not claim to be.

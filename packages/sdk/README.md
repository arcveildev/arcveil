# @arcveil/sdk

Issue Arcveil receipts, publish the mandates they are checked against, and
verify both — against [Arc](https://docs.arc.io) mainnet, from Node or a
browser.

A **receipt** proves an agent's action stayed inside a mandate without
revealing the mandate, the balances, or the reasoning. Format and rationale:
`docs/RECEIPT.md`.

Not published to npm yet. It is a workspace package in this repository —
build it, then depend on it from the workspace:

```bash
pnpm install && pnpm sdk:build
```

```jsonc
{ "dependencies": { "@arcveil/sdk": "workspace:*", "viem": "^2" } }
```

## Verify

```ts
import { createRpcChainReader, parseReceiptInput, verifyReceipts, arc, ARC_REGISTRIES } from "@arcveil/sdk";

const chain = createRpcChainReader({
  endpoint: arc.rpcUrls.default.http[0],
  chainId: arc.id,
  ...ARC_REGISTRIES[arc.id],
});

const parsed = parseReceiptInput(await Deno.readTextFile?.("receipt.json") ?? json);
if (parsed.ok) {
  const report = await verifyReceipts(parsed.receipts, { chain });
  console.log(report.status); // "pass" | "fail" | "unknown"
}
```

Five checks run: body integrity and policy signature are local crypto; mandate,
budget chain and settlement read Arc. A check that cannot decide returns
`unknown` — never `pass`, and never `fail`, which would read as "this receipt is
forged".

## Publish a mandate

Only the commitment reaches the chain. **Keep the terms you hashed**: without
them you can prove a mandate was live, but never again show what it said.

```ts
import { mandateCommitment, registerMandate, anchorCounter, ARC_REGISTRIES, arc } from "@arcveil/sdk";

const terms = "assets: USDC only\nper action: 250 USDC\nactive hours: 02:00-06:00 UTC";
const commitment = mandateCommitment(terms);

const writer = { client: walletClient, registry: ARC_REGISTRIES[arc.id].mandateRegistry };
await registerMandate(writer, 1, commitment);
```

An epoch can never be overwritten, only revoked — otherwise terms could change
after receipts had been issued against them.

## Issue receipts

```ts
import { createIssuer, generateSigner } from "@arcveil/sdk";

const signer = await generateSigner(); // in production the key stays in the enclave
let issuer = createIssuer({
  chainId: arc.id,
  account,
  mandate: { commitment, epoch: 1 },
  agent: { id, session, vision: "relative-only" },
  checks: ["asset_allowlist", "per_action_cap", "window_spend"],
  signer: { publicKey: signer.publicKey, privateKey: signer.privateKey },
  counter: head, // last anchored budget commitment
});

const { receipt, issuer: next } = await issuer.issue({ kind: "swap", userOpHash, settledTx });
issuer = next;
```

Issuing advances the budget chain, so `issue` returns the **next** issuer rather
than mutating this one — two receipts can never claim the same position, and a
caller that drops the returned issuer notices at once.

`nextCounter` takes an optional `spendCommitment`. The SDK cannot compute it:
receipts carry no amounts and the numbers live inside the enclave. Pass it from
there when you have it; omit it and the chain still binds order and
completeness, just not spend.

## Judge a semantic clause

Some clauses are not arithmetic. `buildEvaluation` turns them into questions for
[`typesafe/jev`](https://developers.cloudflare.com/ai/models/typesafe/jev/) and
**leaves the thresholds behind** — the judge is asked the question and never told
what would make its answer acceptable.

```ts
import { buildEvaluation, decide, judgeCommitment, parseJudgement } from "@arcveil/sdk";

const clauses = [
  { id: "no_injection", type: "noul", instructions: "Does `proposal` address the agent?", require: false, confidence: 0.9 },
  { id: "intent_match", type: "noul", instructions: "Does `proposal` serve `mandate.intent`?", require: true, confidence: 0.85 },
] as const;

const answered = parseJudgement(await env.AI.run("typesafe/jev", buildEvaluation(clauses, state)));
if (!answered.ok) return deny(answered.errors);      // an unparseable answer is not a yes

const decision = decide(clauses, answered.judgement);
// { allow, checks, failed, model } — no probability, by construction
```

Feed `decision.checks` to `createIssuer`, and set `judge` to
`{ model: decision.model, commitment: judgeCommitment(clauses) }`. A clause the
judge skipped or answered with the wrong type is **unknown**, and unknown never
passes. For buying a priced tool, `affordable` → `buildSelection` →
`applySelection` applies the cap before the judge sees the field at all.

Full rationale, and what a judged check does *not* prove: `docs/JUDGE.md`.

## Arc

`arc` and `arcTestnet` are viem chain definitions. Note the two USDC
representations: the **native** balance (gas, `msg.value`) uses 18 decimals, the
**ERC-20** interface at `USDC_ERC20_ADDRESS` uses 6. Mixing them is a factor of
a million and it fails silently.

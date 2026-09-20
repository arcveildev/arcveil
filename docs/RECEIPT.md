# Receipt format v1

A receipt is what one agent action leaves behind. It proves the action stayed inside the
account holder's mandate — **without revealing the mandate, the balances, or the reasoning**.

## Body

```jsonc
{
  "v": 1,
  "id": "0x…",                     // sha256 of the canonical body
  "chain": 5042002,
  "account": "0x…",                // smart account (public anyway)
  "mandate": { "commitment": "0x…", "epoch": 7 },
  "agent":   { "id": "0x…", "session": "0x…", "vision": "relative-only" },
  "action":  { "kind": "swap", "userOpHash": "0x…", "settledTx": "0x…", "at": "…Z" },
  "checks":  ["asset_allowlist", "per_action_cap", "window_spend", "active_hours", "killswitch_clear"],
  "judge":   { "model": "jev-1.13.0", "commitment": "0x…" },   // only when a check was semantic
  "counter": { "prev": "0x…", "next": "0x…" },
  "proof":   { "type": "attestation", "signer": "0x…", "signature": "0x…" }
}
```

Check **names** are public; their thresholds stay inside the mandate. No amount, asset or
balance ever appears in a receipt.

- `id` covers the canonical body: keys sorted, no whitespace, `id` itself and the proof
  evidence (`signature` / `data`) excluded. Implemented in `src/lib/receipt/canonical.ts`.
- `counter.prev → counter.next` are commitments to cumulative budget use. Consecutive
  receipts must chain, which is what makes a *dropped* receipt visible.
- `judge` is present only when some of those checks were semantic — answered by a model
  rather than by arithmetic. `commitment` binds the clause set *and its thresholds*, so the
  holder can show later what was asked without the receipt ever revealing it. The field is
  optional: a receipt without it canonicalises to exactly the bytes it did before judges
  existed. The five checks below do **not** re-run it, and nobody outside the gate can —
  see [JUDGE.md](./JUDGE.md) for what that does and does not prove.
- `proof` is a discriminated union. v0.5 ships `attestation` (enclave signature);
  v1 swaps in `zk` and the rest of the format is unchanged.

## The five checks

| Check | Question | Verdicts |
|---|---|---|
| `integrity` | Does the body still hash to its id? | pass / fail |
| `signature` | Did the policy signer sign these exact bytes? | pass / fail / unknown (zk) |
| `mandate` | Was that mandate commitment live at that epoch? | pass / fail |
| `linkage` | Does the budget chain join to the predecessor or an anchor? | pass / fail / unknown |
| `settlement` | Did the transaction it points at succeed? | pass / fail / unknown |

`unknown` is a first-class verdict: a check that cannot decide must never report a pass.
The overall verdict is the worst of the five.

## Verifying

`/verify` runs all five in the browser. Two are pure local crypto; the other three
read **Arc mainnet** (chain 5042) through `createRpcChainReader`
(`src/lib/receipt/rpc.ts`) — `mandate` and `linkage` call the registries below,
`settlement` is an `eth_getTransactionReceipt`. Arc's RPC allows cross-origin
requests, so no backend of ours sits in the path.

| Registry | Address |
|---|---|
| `MandateRegistry` | `0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5` |
| `AnchorRegistry` | `0xb2af157f269b31e315099e9da693096833ab8289` |

Leave either address null in `ARC` (`src/data/site.ts`) and the reader throws for
that check, which the verifier turns into `unknown` — never a `fail`, which would
read as "this receipt is forged".

The bundled samples settle in real Arc transactions and are published under the
mandate in `contracts/demo/mandate.json`, so all five checks resolve against the
chain. Regenerate them with `pnpm gen:receipts` — a throwaway signing key is
created per run, so no private material is ever committed.

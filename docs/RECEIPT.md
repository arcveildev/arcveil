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

`/verify` runs all five in the browser — no request leaves the tab. Chain lookups go
through `ChainReader` (`src/lib/receipt/chain.ts`); v0 uses the in-memory reader over
`src/data/sample-receipts.json`, and the RPC reader replaces it once the mandate
contracts are deployed to Arc (mainnet 5042, testnet 5042002 — the samples are
testnet). Regenerate the samples with `pnpm gen:receipts` — a throwaway key
is created per run, so no private material is ever committed.

# Arcveil contracts

Two registries, both deliberately dull: they publish commitments and nothing
else. Neither holds funds, neither can move funds, and neither can read a
mandate — that is the point.

| Contract | What it answers |
|---|---|
| `MandateRegistry` | Was this mandate commitment live at this epoch, for this account? |
| `AnchorRegistry` | Was this budget commitment anchored by this account? |

Together they turn the verifier's two `unknown` checks (`mandate`, `linkage`)
into real answers.

## Invariants worth keeping
- **A commitment is never overwritten.** An epoch can be revoked, never rewritten
  — otherwise terms could change after receipts had been issued against them.
- **A revoked mandate keeps its commitment**, so receipts issued while it was
  live stay checkable and stay true.
- **Anchors are append-only per account.** Re-anchoring the same commitment is
  refused, so a budget chain cannot quietly fork.
- **Nothing here reveals anything.** Commitments are opaque: no amount, no
  asset, no limit, no counterparty.

## Setup
Foundry is not vendored. Install it yourself, then:

```bash
cd contracts && forge install foundry-rs/forge-std && forge test -vvv
```

## Deploy
Import a key into Foundry's keystore once, so no private key ever lands in a
file or an environment variable:

```bash
cast wallet import arcveil-deployer --interactive
```

Then, testnet first:

```bash
cd contracts && forge script script/Deploy.s.sol --rpc-url arc_testnet --account arcveil-deployer --broadcast
```

and mainnet when you are satisfied:

```bash
cd contracts && forge script script/Deploy.s.sol --rpc-url arc --account arcveil-deployer --broadcast
```

Gas on Arc is paid in USDC, so the deployer needs a USDC balance on the network
you are deploying to.

Afterwards, paste the two addresses into `ARC.mandateRegistry` and
`ARC.anchorRegistry` in `src/data/site.ts`. The verifier picks them up with no
other change — `createRpcChainReader` stops reporting `unknown` for those checks
as soon as the addresses are non-null.

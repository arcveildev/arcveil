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

## Deployed on Arc mainnet (chain 5042)
| Contract | Address |
|---|---|
| `MandateRegistry` | `0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5` |
| `AnchorRegistry` | `0xb2af157f269b31e315099e9da693096833ab8289` |

Deployed at block 21186110, runtime bytecode byte-identical to the local build.
The demo mandate is published from `0x96b698308B01473E3A0041634b01f652c4608C2A`,
which is why the samples on `/verify` resolve.

## Status
21 tests pass on Foundry 1.8.3 (11 for the mandate registry including a fuzzed
one, 6 for anchors, 4 for the seeding script), `forge fmt` is clean and
`forge build` reports no lint warnings. Runtime sizes are 1,195 B and 736 B.

The frontend's hand-written ABI in `src/lib/receipt/abi.ts` was checked against
the compiled artifacts: `mandateOf(address,uint64) -> ((bytes32,uint64,uint64))`
and `isAnchored(address,bytes32) -> (bool)` match exactly. Re-check that after
changing any signature here.

## Setup
`lib/` is not committed. Fetch dependencies, then run the suite:

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
you are deploying to. Deploying both registries simulates at 681,873 gas —
about **0.06 USDC** at current base fees.

**Arc's two USDC representations.** The native balance (gas, `msg.value`,
native sends) uses **18 decimals** like ether; the ERC-20 interface at
`0x3600000000000000000000000000000000000000` uses the familiar **6**. Divide a
native figure by 10^12 to read it as USDC. Nothing in these contracts touches
amounts, so the distinction cannot bite here — but it will the moment anything
does, and it fails silently.

Afterwards, paste the two addresses into `ARC.mandateRegistry` and
`ARC.anchorRegistry` in `src/data/site.ts`. The verifier picks them up with no
other change — `createRpcChainReader` stops reporting `unknown` for those checks
as soon as the addresses are non-null.

## Seeding the demo mandate
Until something is published for the samples' account, the mandate and
budget-chain checks on `/verify` answer `unknown` — correctly, because nothing
about them exists on chain. To make the samples resolve, publish the demo
mandate from the same wallet that owns them:

```bash
ARC_SAMPLE_ACCOUNT=0xYourDeployerAddress pnpm gen:receipts
```

That regenerates the samples **and** writes `contracts/demo/mandate.json`, which
is the single source of truth: the seeding script publishes exactly the values
the receipts claim. Then:

```bash
cd contracts && MANDATE_REGISTRY=0x... ANCHOR_REGISTRY=0x... forge script script/SeedSamples.s.sol --rpc-url arc --account arcveil-deployer --broadcast
```

The script refuses to run from a wallet other than the one in the JSON — both
registries key everything by `msg.sender`, so seeding from elsewhere would
publish a mandate no receipt refers to. It is idempotent, so a re-run after a
partial failure resumes rather than reverting.

The demo mandate's terms are in the JSON in plain text on purpose: a real
mandate's terms never leave its owner, and the sample exists to show that the
chain stores only their hash. Anyone can keccak256 that text and get the
commitment.

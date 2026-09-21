# Arcveil contracts

Two registries, both deliberately dull: they publish commitments and nothing
else. Neither holds funds, neither can move funds, and neither can read a
mandate — that is the point.

| Contract | What it answers |
|---|---|
| `MandateRegistry` | Was this mandate commitment live at this epoch, for this account? |
| `AnchorRegistry` | Was this budget commitment anchored by this account? |
| `ArcveilAccount` | Do two of the three keys authorise this call, and is the mandate still live? |

`ArcveilAccount` is a 2-of-3 account: device key, policy co-signer, recovery
key. Any two authorise a call, which is what makes the co-signer *refusable*
rather than custodial — it can decline, but device + recovery move funds without
it, and it can never move them alone. Every execution is gated on the mandate
being live, so revoking one stops the agent on chain.

The mandate gate lives in execution, never in validation: ERC-4337 forbids an
unstaked account from reading another contract's storage while a bundler
simulates, so checking the registry there would get the account throttled.
Validation checks signatures; execution checks the mandate.

**An account is born holding its mandate.** The constructor registers the first
one, because it is the only moment it can: every later call is gated on a live
mandate, so the call that published the first would never pass the gate. Later
epochs go through `adoptMandate`, its own entry point rather than a hole in the
gate — rotating a mandate is governance, not spending — and epochs only ever
advance, so an older, looser mandate cannot be reinstated.

Its EIP-712 intent and adoption digests are asserted against the same fixtures in
`packages/sdk/src/account.test.ts`. If the typehash, domain or field order
drifts on either side, one of the two suites fails — otherwise the seam would
only surface as "signature invalid" against a live account.

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

## Bootstrap an account
One transaction: the account is deployed and publishes its own first mandate.

First you need three keys that are genuinely three different holders — that is
the entire point of 2-of-3. Create them as encrypted keystores, so no private
key is ever printed or stored in a file you have to guard:

```bash
cast wallet new ~/.foundry/keystores arcveil-device
cast wallet new ~/.foundry/keystores arcveil-cosigner
cast wallet new ~/.foundry/keystores arcveil-recovery
```

Each prints its address, which is what the script wants. In production these
live in three different places — the device holds one, the co-signer service
holds one, and recovery sits behind a passkey; generating all three here is a
first account to learn on, not a threat model.

```bash
cd contracts && DEVICE=0x... COSIGNER=0x... RECOVERY=0x... \
  MANDATE_REGISTRY=0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5 \
  MANDATE_TERMS=$'assets: USDC only\nper action: 250 USDC\nper day: 1000 USDC' \
  forge script script/DeployAccount.s.sol --rpc-url arc --account arcveil-deployer --sender 0xYourDeployer --broadcast
```

Keep the terms you hashed. The chain stores only the commitment: lose the text
and you can prove the mandate was live, but never show what it said.

The three keys must be three different addresses — the constructor refuses a
repeat, because that is 2-of-2 wearing a 2-of-3 label.

## Deployed on Arc mainnet (chain 5042)
| Contract | Address |
|---|---|
| `MandateRegistry` | `0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5` |
| `AnchorRegistry` | `0xb2af157f269b31e315099e9da693096833ab8289` |
| `ArcveilAccount` (first) | `0xb1c0983a7b84f38fbaf5f3af92f0fecaa62ce25d` |

The first account was bootstrapped at block 21194397 on EntryPoint v0.7, holding
epoch 1 of its mandate from birth. Its three keys are distinct, and the deployer
is deliberately not one of them: the wallet that paid for the deployment has no
authority over the account.

Verifying an account's bytecode is not a plain comparison — the three keys, the
EntryPoint and the registry are immutables baked into the runtime code, so the
artifact's copy has those slots zeroed. Mask them using
`deployedBytecode.immutableReferences` from the artifact and compare the rest.

Deployed at block 21186110, runtime bytecode byte-identical to the local build.
The demo mandate is published from `0x96b698308B01473E3A0041634b01f652c4608C2A`,
which is why the samples on `/verify` resolve.

## The private bridge

`VeilGateway` turns one CCTP burn on any supported chain into one shielded
deposit on Arc. The burn names the gateway as both `mintRecipient` and
`destinationCaller` and carries the deposit's precommitment in `hookData`; the
gateway mints the USDC and puts it into the pool in the same transaction.

The pool itself is not ours. `privacy/` is a verbatim copy of
[0xbow-io/privacy-pools-core](https://github.com/0xbow-io/privacy-pools-core) at
commit `c312dcd5`, Apache-2.0, audited by Oxorio and Auditware. Nothing in it is
modified, because the audits and the trusted setup only apply to those exact
bytes. `privacy/VERIFY.md` is how anyone checks that claim without trusting us.

| Piece | Whose | Audited |
|---|---|---|
| `Entrypoint`, `PrivacyPool`, circuits, verifiers | 0xbow | yes, upstream |
| `VeilGateway` | ours | **no** |
| Relayer, ASP postman | ours | **no** |

### What is public, and what is not
The burn on the source chain names the sender, the amount and the gateway. The
mint and the deposit on Arc are public. Every withdrawal is public — recipient,
amount, time. The single thing that is private is **which deposit funds which
withdrawal**, and that holds only against the anonymity set the pool has at that
moment. The first depositor into an empty pool has no privacy at all, and the
interface has to say so rather than imply otherwise.

The association set currently admits every label, unfiltered. That makes this a
mixer in function. The mechanism is the upstream one, so the policy can be
tightened later without redeploying, but today nothing is screened.

### Deploy
```bash
cd contracts && POSTMAN=0x… VEIL_OWNER=0x… \
  forge script script/DeployVeil.s.sol --rpc-url arc_testnet --account arcveil-deployer --broadcast
```

`VEIL_OWNER` should be the 2-of-3 `ArcveilAccount`: the Entrypoint is UUPS, so
whoever holds `OWNER_ROLE` can replace its logic. The script grants the role and
renounces the deployer's in the same transaction; leave it unset and a single
key keeps that power, which is fine on testnet and not on mainnet. `POSTMAN` is
a separate hot key that publishes association-set roots — never the 2-of-3.

Simulated on Arc testnet the whole deployment is 17,473,952 gas, about
**0.79 USDC**.

### Testing against the real chain
`test/VeilGateway.t.sol` forks Arc mainnet at a pinned block, so the CCTP
contracts under test are Circle's own. The test takes over the attester set,
which proves nothing about Circle's signing and everything about our parsing.

Two things about Arc surfaced only by running it, and both are worth knowing:

- USDC at `0x3600…0000` is a 6-decimal view over the chain's 18-decimal native
  balance, and every mint and transfer is delegated to a precompile at
  `0x1800…0000`. A precompile is not bytecode, so a fork has nothing to fetch.
- Arc has a **compliance precompile** at `0x1800…0001`, asked `isBlocklisted`
  on every USDC movement. The chain itself can refuse a transfer, including one
  out of this pool. That is real on mainnet and absent from the fork.

So the test replaces the token and keeps the bridge: `ArcUsdcStub` is etched
over USDC, while MessageTransmitterV2 and TokenMessengerV2 stay real. Arc's own
blocklist is therefore *not* covered by any test here.

## Status
71 tests pass on Foundry 1.8.3 (11 for the mandate registry including a fuzzed
one, 6 for anchors, 6 for the seeding script, 28 for the account, 11 for the
veil gateway, and 9 that exist to pin the TypeScript side: Poseidon vectors,
LeanIMT roots, the withdrawal context, and a real proof put in front of the
deployed verifier). `forge fmt` is clean and `forge build` reports no lint
warnings. Runtime sizes are 1,195 B, 736 B and 4,673 B.

The frontend's hand-written ABI in `src/lib/receipt/abi.ts` was checked against
the compiled artifacts: `mandateOf(address,uint64) -> ((bytes32,uint64,uint64))`
and `isAnchored(address,bytes32) -> (bool)` match exactly. Re-check that after
changing any signature here.

## Setup
`lib/` is not committed. `deps.sh` fetches everything at pinned versions — the
four the Privacy Pool protocol needs come from npm at the exact versions its own
manifest pins, so the dependency set matches the one its audits were run
against:

```bash
cd contracts && ./deps.sh && forge test -vvv
```

The fork test in `test/VeilGateway.t.sol` needs to reach `rpc.mainnet.arc.io`
once to fill Foundry's RPC cache; without network it skips itself and the rest
of the suite still runs.

## Bootstrap an account
One transaction: the account is deployed and publishes its own first mandate.

First you need three keys that are genuinely three different holders — that is
the entire point of 2-of-3. Create them as encrypted keystores, so no private
key is ever printed or stored in a file you have to guard:

```bash
cast wallet new ~/.foundry/keystores arcveil-device
cast wallet new ~/.foundry/keystores arcveil-cosigner
cast wallet new ~/.foundry/keystores arcveil-recovery
```

Each prints its address, which is what the script wants. In production these
live in three different places — the device holds one, the co-signer service
holds one, and recovery sits behind a passkey; generating all three here is a
first account to learn on, not a threat model.

```bash
cd contracts && DEVICE=0x... COSIGNER=0x... RECOVERY=0x... \
  MANDATE_REGISTRY=0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5 \
  MANDATE_TERMS=$'assets: USDC only\nper action: 250 USDC\nper day: 1000 USDC' \
  forge script script/DeployAccount.s.sol --rpc-url arc --account arcveil-deployer --sender 0xYourDeployer --broadcast
```

Keep the terms you hashed. The chain stores only the commitment: lose the text
and you can prove the mandate was live, but never show what it said.

The three keys must be three different addresses — the constructor refuses a
repeat, because that is 2-of-2 wearing a 2-of-3 label.

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

## First execution on mainnet
`0xd110e7255737eed92bf59b3df6e656688bc9acf6ed2f33f72ae306f157937bb3`, block
21195992, 120,280 gas. The account anchored the first commitment of its budget
chain, authorised by device + co-signer.

Two things in that transaction are worth reading carefully, because they are
claims this project makes in prose everywhere else:

- `Anchored.account` is the **account**, not the wallet that sent the
  transaction. The relayer was the deployer, which is not one of the three keys
  and holds no authority over the account — it only paid the gas. Authority
  lives in the signatures.
- `Executed` carries epoch 1 and commitment `0xa69da9d9…977b`, the account's
  real mandate. Nothing executes without naming a mandate that is live.

The account's nonce advanced to 1, so those two signatures cannot be replayed.

## Revocation, demonstrated on mainnet
`0x78f194852e5f02fce8ba3524daf7eff27bc47daa4c9c32c398d5fec75a461372`, block
21197420. The account revoked its own epoch 1, authorised by device +
co-signer. `mandateOf` now carries a `revokedAt`, and `isLive` is false.

What that buys is checkable rather than asserted. Asking the account to execute
under epoch 1 afterwards — `eth_call` through the EntryPoint path, which needs
no signature and no gas — reverts with selector `0xb254c866`,
`MandateNotLive(1, 0xa69da9d9…977b)`. The refusal comes from the contract, not
from a policy engine we happen to run: revoking stops the agent even if every
key and every server agreed to carry on.

The commitment survives revocation, so receipts issued while epoch 1 was live
stay checkable and stay true.

## Executing through an account
`pnpm intent` prepares and relays one intent. It never touches a key: it writes
the EIP-712 payload for `cast wallet sign`, which reads the encrypted keystore
and prompts for the password.

```bash
export ACCOUNT=0xb1c0983a7b84f38fbaf5f3af92f0fecaa62ce25d
export MANDATE_TERMS=$'assets: USDC only\nper action: 250 USDC\nper day: 1000 USDC'

pnpm intent prepare anchor 0x<commitment>     # or: revoke <epoch> | transfer 0x<to> <usdc>
cast wallet sign --data --from-file .arcveil/intent.typed.json --account arcveil-device
cast wallet sign --data --from-file .arcveil/intent.typed.json --account arcveil-cosigner
pnpm intent send 0x<sig1> 0x<sig2>
```

Three things are checked before any gas is spent: that `MANDATE_TERMS` hashes to
the commitment the account actually holds, that the payload hashes to the digest
**the account itself computes** — asked of the deployed contract, not assumed —
and that the two signatures recover to two different members. Each of those
would otherwise surface as an unexplained revert after paying for it.

Relaying is permissionless: any funded wallet can send the transaction, because
authority lives in the signatures, not in the sender.

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

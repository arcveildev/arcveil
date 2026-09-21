# @arcveil/relay

Submits shielded withdrawals, and publishes the association-set root.

## Why it has to exist

Gas on Arc is USDC. A freshly created address has none, so it cannot pay for
the transaction that pays it. Funding it first from a wallet you already own
would rebuild, in one transfer, the exact link the pool was used to break.

So someone else sends the transaction. This is that someone.

## What it can and cannot do

The recipient, the fee and the pool are all hashed into the proof's `context`
signal, and the pool recomputes that hash before it pays anyone. So a relayer:

- **cannot** redirect a withdrawal,
- **cannot** raise its own fee,
- **cannot** learn the note, the deposit, or which deposit funded the withdrawal,
- **can** refuse to submit — which is why the endpoint is one relayer, not the
  only possible one. Anyone can run this and submit the same proof.

What it does unavoidably see, while a request is in flight: the recipient
address, the amount, and the IP that sent it. That is the honest cost of not
paying your own gas, and it is stated on `/bridge` rather than buried here.

## What it stores

Nothing. Not as a policy that could change — it has nothing to store. Every
check is made against the chain in the moment of the request:

- Is the proof valid? `eth_call` runs the deployed verifier, for free, before
  anything is signed. Verifying the proof in the Worker would mean shipping a
  proving library and a verification key and keeping both in step with the
  deployed verifier; the chain's own answer cannot drift.
- Has this note already been spent? The simulation reverts if so.

There is no database binding, so there is no record of who was paid.

## Endpoints

| | |
|---|---|
| `GET /quote` | The entrypoint, pool, scope, fee recipient and minimum fee. Build the proof against these — they are bound into it. |
| `GET /status` | Deposits in the pool, the current root, and whether the published root is current. |
| `POST /withdraw` | `{ recipient, relayFeeBPS, proof }`. Returns `{ hash }`. |

There is no bearer token, on purpose. A token is an account, an account is an
identity, and an identity attached to a withdrawal is the link the pool exists
to break. The endpoint is rate limited instead, and it only ever signs after a
free simulation says the transaction succeeds — so an abusive caller cannot
make it spend anything.

## The postman

A cron publishes the association-set root. Until it runs, a fresh deposit's
label is in no published set and cannot be withdrawn privately — only pulled
back publicly through `VeilGateway.ragequit`, which needs nobody's permission.

**The policy admits every label, unfiltered.** Nothing is screened, nothing is
excluded, and that makes this pool a mixer in function. The mechanism is the
upstream Privacy Pools one, so a stricter policy can be introduced later
without redeploying — but that is a future tense, and the page says so in the
present.

`updateRoot` takes an `ipfsCID` of 32–64 characters. Nothing is pinned to IPFS,
because there is nothing to pin: the set is every `Deposited` event the pool
ever emitted, and anyone can rebuild it from the chain. What is published there
instead is the keccak digest of the label list, so anyone can check that the
postman published the set it claims. See `digestOf` in `src/asp.ts`.

## Deploy

```bash
pnpm --filter @arcveil/relay deploy
```

Two keys, deliberately separate, and neither is the 2-of-3 that owns the
Entrypoint:

```bash
cd packages/relay
wrangler secret put RELAYER_KEY   # pays gas, receives the relay fee
wrangler secret put POSTMAN_KEY   # publishes ASP roots, moves no money
```

and the settings:

| | |
|---|---|
| `ARC_RPC` | `https://rpc.mainnet.arc.io` |
| `ENTRYPOINT` | the Privacy Pool Entrypoint on Arc |
| `SCOPE` | the pool's scope, decimal — printed by `DeployVeil.s.sol` |
| `FROM_BLOCK` | the block the pool was deployed in |
| `MIN_FEE_BPS` | optional, defaults to 25 |
| `RELAY_ORIGIN` | optional, the one browser origin allowed to call this |

`RELAYER_KEY` needs a USDC balance on Arc to pay gas. It is a hot key on a
server: keep it small, rotate it, and expect to lose it one day.

## Not audited

`VeilGateway`, this relayer and the postman are ours and none of them has been
audited. Only the pool contracts underneath are, upstream. See
`contracts/privacy/VERIFY.md`.

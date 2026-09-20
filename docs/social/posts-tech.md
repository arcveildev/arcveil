# Five tech posts (2026-09-17)

One post per piece of the system, each paired with a banner in
`banners/tech-*.png`. House rules carried over from the launch and pipeline
posts: short declarative lines, no hashtags, no emoji, and nothing in the
present tense that is not shipped. Where a claim describes the design rather
than the build, the post says so in its own words — that line is not optional
copy, it is the reason the rest is believable.

Sources: `docs/RECEIPT.md`, `src/data/specs.ts`, `src/data/threatModel.ts`,
`src/data/escapeHatch.ts`, `packages/sdk/README.md`.

---

## 01 · The five checks → `banners/tech-checks.png`

> A verifier that can only say pass is decoration.
>
> An Arcveil receipt runs five: body integrity, policy signature, mandate,
> budget chain, settlement. Two are local crypto. Three read Arc mainnet
> straight from your browser — no backend of ours in the path.
>
> A check that cannot decide returns unknown. Never pass, and never fail,
> which would read as "this receipt is forged".
>
> arcveil.dev/verify

Shorter alt:

> Five checks per receipt. Two local, three against Arc mainnet, none of them
> through a server of ours.
>
> The third verdict is unknown, and it is the one that makes the other two
> worth anything.
>
> arcveil.dev/verify

---

## 02 · The counter chain → `banners/tech-counter.png`

> Faking a receipt is hard. Quietly deleting one is the attack that actually
> pays.
>
> So every receipt commits to cumulative budget use before and after it, and
> consecutive receipts have to join. Drop one and the next no longer links to
> its predecessor.
>
> A missing receipt is not invisible. It shows up later as a gap.
>
> Receipt format v1: arcveil.dev

---

## 03 · The mandate registry → `banners/tech-mandate.png`

> Spending rules do not have to be public to be enforceable.
>
> Only a commitment to your mandate reaches Arc. The assets, the per-action
> cap, the hours stay with you. An epoch can never be overwritten, only
> revoked — otherwise the terms could change after receipts were issued
> against them.
>
> Keep what you hashed. Without it you can prove a mandate was live, and never
> again show what it said.
>
> MandateRegistry, Arc mainnet: 0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5

---

## 04 · What each party sees → `banners/tech-vision.png`

> The agent asks to reduce exposure to A by 30%. It never says how much,
> because it was never told.
>
> The model provider gets a relative instruction and redacted context. A chain
> observer gets that an operation happened. Our co-signer gets a policy check
> that validated — not the terms it was checked against.
>
> You get all of it, plus who read what.
>
> Enclave execution is designed, not deployed. We would rather publish the
> architecture than imply it is finished.

---

## 05 · If we disappear → `banners/tech-escape.png`

> Every co-signer deserves the same question: what happens when it refuses, or
> stops existing.
>
> Mandates carry their own expiry, so stopping an agent never requires us to be
> reachable. Your device shard and passkey recovery are a quorum without us.
> The verifier is client-side, so receipts you already hold stay checkable with
> no server, ours or anyone's.
>
> What you lose while our signer is down: the agent cannot act. That is the
> failure we picked — an agent that stops is recoverable, an agent that keeps
> spending is not.
>
> The escape hatch contract is designed, not shipped. It lands with the mandate
> contracts.

---

## Posting order

01 → 02 → 03 are shipped material and can go out as they are. 04 and 05
describe designed-not-deployed parts, so they must keep their closing status
line; without it the present tense reads as a claim the build does not support.

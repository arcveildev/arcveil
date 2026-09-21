# The private bridge (2026-09-21)

House rules carried over: short declarative lines, no hashtags, no emoji, and
nothing in the present tense that is not shipped.

**Not live yet.** `VeilGateway`, `@arcveil/bridge`, the relayer and `/bridge`
are committed and tested; none of them is deployed. No post here says a person
can bridge privately into Arc today, and none links to `arcveil.dev/bridge`
until the deploy lands. Posts 01 to 03 stand on their own and can go out now —
they are findings about Arc, not claims about us.

**Before posting 04, 05 or 06, decide this on purpose.** The association set admits
every label, unfiltered, which makes the pool a mixer in function. A post is
what brings that to the attention of people who care about it — Circle among
them, on Circle's own chain, through Circle's own CCTP. That is not a reason
not to post. It is a reason to post the version you would be comfortable
defending, and to have the ASP answer ready before anyone asks it.

Sources: `contracts/src/VeilGateway.sol`, `contracts/test/VeilGateway.t.sol`,
`contracts/test/WithdrawalProof.t.sol`, `packages/bridge/`, `docs/BRIDGE_RUNBOOK.md`.

Occasion: @arc's post of 2026-09-19 launching USDC Bridge.

---

## 01 · Main — what Arc's USDC actually does

The strongest one, and it costs nothing to claim: anyone can check it.

Banner: `banners/dark-precompile-v1.png` — the three addresses, only the
readable one lit. `banners/tech-precompile.png` is the same card in the older
pastel series, kept for reference.

> Arc's USDC is not an ERC-20 with a balance mapping.
>
> The token at 0x3600…0000 holds no balances. It is a 6-decimal view over the
> chain's 18-decimal native balance: `transfer` hands off to a precompile at
> 0x1800…0000, scaled by 1e12. Read one as the other and you are out by a
> trillion, silently. The mint path calls a second precompile, 0x1800…0001,
> with `isBlocklisted`.
>
> Neither is EVM code, so neither can be forked, read, or reasoned about from
> outside.
>
> Found by tracing a transfer on a fork at block 21,800,000.
>
> arcveil.dev

---

## 02 · The decimals → `banners/dark-precompile-v2.png`

Stands alone, needs no product, and can go out any day. The one most likely to
be useful to somebody at the moment they read it.

> On Arc, USDC's ERC-20 face has 6 decimals. The balance underneath it has 18.
>
> They are the same money. Read one as the other and every amount is out by
> 10^12 — a trillion — and nothing reverts, because nothing is broken. Both
> numbers are valid. They are in different units.
>
> `transfer` hands the value to a precompile that does the scaling. Your code
> never sees it happen, and neither does your test.
>
> Traced on a fork of Arc mainnet at block 21,800,000.
>
> arcveil.dev

---

## 03 · The fork test → `banners/dark-precompile-v3.png`

Same finding, aimed at people who are about to lose an afternoon.

> If your Arc fork test dies with OpcodeNotFound, this is why.
>
> USDC on Arc delegates to precompiles. A fork has no precompile to fetch, so
> the call has nothing to run and the trace stops there.
>
> The fix is not to mock the chain. Replace the token, keep Circle's CCTP
> contracts, and say in the test what that no longer covers.
>
> arcveil.dev

---

## 04 · The announcement — chosen

Banner: `banners/soon-bridge-v1.png` — the arch, `<LogoMark>` made physical.

The banner already carries the headline, so the post does not repeat it. It
opens on what Circle's own bridge does, because that is the thing everyone
reading has just seen launch, and the contrast is the whole argument.

> Circle's USDC Bridge publishes every part of a crossing: who sent it, how
> much, and where it landed.
>
> Arcveil built one that doesn't.
>
> A CCTP burn on Ethereum, Base, Arbitrum, OP or Polygon becomes one shielded
> deposit on Arc. The deposit is public. Every withdrawal is public. Which
> deposit paid which withdrawal is not.
>
> Built and tested against Circle's live CCTP contracts on a fork of Arc
> mainnet. Not deployed, and no date.
>
> arcveil.dev

### Short version

If it has to fit 280 characters.

> Circle's USDC Bridge publishes who sent it, how much, and where it landed.
>
> Arcveil built one that doesn't. One CCTP burn in, one shielded deposit on
> Arc. The deposit is public. The withdrawal is public. The link is not.
>
> Built and tested. Not deployed. arcveil.dev

### Do not

- Link to `arcveil.dev/bridge`. It exists and it correctly reports that
  nothing is deployed, which is the right page at the wrong moment. Close on
  `arcveil.dev` instead — every post above does, the way the gate posts close
  on `arcveil.dev/gate`. A post that never names the product is one nobody can
  attribute after it is screenshotted.
- Say it hides a transaction. It hides which deposit paid which withdrawal,
  and nothing else. Every version above is written to make that impossible to
  misread, and a reply that softens it undoes the banner.
- Give a date. There is no deploy key in this repository and no date to give.

### Replies to have ready

Both of these are coming. Answering them in an hour reads as candour;
answering them in a day reads as a comms cycle.

**"So it's a mixer."**

> In function, today, yes. The association set admits every label without
> filtering, and the page says that in those words.
>
> The mechanism is Privacy Pools, unmodified, so the policy can be tightened
> without redeploying anything. That is a future tense and we are not going to
> write it as a present one.

**"What's audited?"**

> The pool contracts and the circuits are Privacy Pools by 0xbow, copied at
> commit c312dcd5 and audited by Oxorio and Auditware. contracts/privacy has a
> hash manifest and the steps to check that copy against upstream yourself.
>
> The gateway, the relayer and the ASP postman are ours and are audited by
> nobody. That is why nothing is deployed.

**"When?"**

> No date. The deploy needs keys this repository does not hold.

---

## 05 · The crossing → `banners/soon-bridge-v2.png`

For the people who will ask how it works rather than what it claims.

> Getting into a shielded pool usually takes two transactions: bridge in, then
> deposit.
>
> Arcveil's is one. The CCTP burn names the gateway on Arc as both the payee and
> the only address permitted to deliver the message, and carries the deposit's
> commitment in the hook. The gateway mints and deposits in the same
> transaction.
>
> It holds nothing between transactions. It has no owner, no pause and no
> sweep, and if the deposit cannot be made the USDC goes back to the address
> the burn named rather than nowhere.
>
> Built and tested against Circle's live CCTP contracts. Not deployed.
>
> arcveil.dev

---

## 06 · What "private" is doing → `banners/soon-bridge-v3.png`

The one to post if the announcement draws a sceptic, and the one worth posting
even if it does not.

> "Private" is doing a lot of work in most announcements. Here is all of it
> Arcveil's bridge is doing.
>
> Not the ledger: every deposit and every withdrawal sits on Arc, in public,
> permanently.
> Not the amounts: both are visible.
> Not the audit trail: anyone can total the pool to the cent.
>
> One thing. Which deposit paid which withdrawal.
>
> And that is worth exactly as much as the number of deposits sitting in the
> pool alongside yours — nothing at all, when that number is one.
>
> Coming. Not deployed.
>
> arcveil.dev

---

## 07 · The honest ledger

The most on-brand of the four, and the least likely to be misread.

> A private bridge that only lists what it hides is advertising.
>
> Public: the burn, your address, the amount, the deposit, the pool balance,
> and every withdrawal.
> Private: which deposit funded which withdrawal.
> Seen by one party: the recipient and your IP, by whichever relayer you pick.
>
> That is one line of privacy and six of exposure, and the page says so in
> that order.
>
> arcveil.dev

---

## 08 · Reply-only — the proof

Not a standalone post. Use if someone asks whether it actually works.

> A withdrawal proof built in the browser, against the Privacy Pools ceremony
> key, takes 1.8 seconds.
>
> The same proof is put in front of the Groth16 verifier we deploy, in a
> Foundry test, and accepted — then rejected four more times with one public
> signal tampered with each way.

---

## Which to post

01 to 03 are findings about Arc and can go out now, in any order, with or
without the rest. 02 is the one a stranger is most likely to thank you for.

04 is the announcement, and 05 and 06 are the same announcement from further
in — post them days apart or not at all, because three posts about one
unshipped thing reads as a countdown to a date that does not exist.

07 is the one to keep for when somebody accuses the thing of being a privacy
theatre. It answers that before it is asked.

08 is a reply.

## What none of these say

- That anyone can use it. Nothing is deployed.
- That it is audited. The pool contracts and circuits are, upstream, by Oxorio
  and Auditware. `VeilGateway`, the relayer and the postman are not.
- That the association set filters anything. It does not.
- That a blocklist does or does not apply to transfers. The precompile cannot
  be read, so that is not ours to assert. 01 says only what was traced.

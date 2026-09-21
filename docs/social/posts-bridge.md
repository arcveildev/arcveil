# The private bridge (2026-09-21)

House rules carried over: short declarative lines, no hashtags, no emoji, and
nothing in the present tense that is not shipped.

**Not live yet.** `VeilGateway`, `@arcveil/bridge`, the relayer and `/bridge`
are committed and tested; none of them is deployed. No post here says a person
can bridge privately into Arc today, and none links to `arcveil.dev/bridge`
until the deploy lands. Posts 01 and 02 stand on their own and can go out now —
they are findings about Arc, not claims about us.

**Before posting 03 or 04, decide this on purpose.** The association set admits
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

> Arc's USDC is not an ERC-20 with a balance mapping.
>
> The token at 0x3600…0000 is a 6-decimal view over the chain's 18-decimal
> native balance. `transfer` hands off to a precompile at 0x1800…0000, scaled
> by 1e12. The mint path calls another one, 0x1800…0001, with
> `isBlocklisted`.
>
> Neither is EVM code, so neither can be forked, read, or reasoned about from
> outside.
>
> Found by tracing a transfer on a fork at block 21,800,000.

---

## 02 · Alt main — the thing that breaks your tests

Same finding, aimed at people who are about to lose an afternoon.

> If your Arc fork test dies with OpcodeNotFound, this is why.
>
> USDC on Arc delegates to precompiles. A fork has no precompile to fetch, so
> the call has nothing to run and the trace stops there.
>
> The fix is not to mock the chain. Replace the token, keep Circle's CCTP
> contracts, and say in the test what that no longer covers.

---

## 03 · The bridge — built, not deployed

Only after 01 or 02. Do not post with a link until the deploy lands.

> Circle's USDC Bridge publishes every part of a crossing: sender, amount,
> destination.
>
> We built one that doesn't. A CCTP burn names a gateway on Arc as both payee
> and sole deliverer, carrying the deposit's commitment in the hook. It mints
> and deposits into a Privacy Pool in one transaction.
>
> The deposit is still public. Every withdrawal is still public. What is hidden
> is which deposit paid which withdrawal.
>
> Built and tested against Circle's live CCTP contracts on a fork of Arc
> mainnet. Not deployed.

---

## 04 · The honest ledger

The most on-brand of the four, and the least likely to be misread.

> A private bridge that only lists what it hides is advertising.
>
> Public: the burn, your address, the amount, the deposit, the pool balance,
> and every withdrawal.
> Private: which deposit funded which withdrawal.
> Seen by one party: the recipient and your IP, by whichever relayer you pick.
>
> That is one line of privacy and six of exposure, and the page says so in that
> order.

---

## 05 · Reply-only — the proof

Not a standalone post. Use if someone asks whether it actually works.

> A withdrawal proof built in the browser, against the Privacy Pools ceremony
> key, takes 1.8 seconds.
>
> The same proof is put in front of the Groth16 verifier we deploy, in a
> Foundry test, and accepted — then rejected four more times with one public
> signal tampered with each way.

---

## What none of these say

- That anyone can use it. Nothing is deployed.
- That it is audited. The pool contracts and circuits are, upstream, by Oxorio
  and Auditware. `VeilGateway`, the relayer and the postman are not.
- That the association set filters anything. It does not.
- That a blocklist does or does not apply to transfers. The precompile cannot
  be read, so that is not ours to assert. 01 says only what was traced.

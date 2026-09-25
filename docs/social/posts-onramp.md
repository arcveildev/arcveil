# Onramp Kit, wired in on the sandbox (2026-09-26)

Quote of @arc's launch: x.com/arc/status/2103514871312629993.
Banner: `banners/soon-onramp-v2.png` (v1 is the alternate).

House rules carried over: short declarative lines, no hashtags, no emoji, and
nothing in the present tense that is not shipped.

**What is shipped, exactly.** `onramp.arcveil.dev` (Worker) and
`arcveil.dev/fund` (page) are deployed, against Circle's **sandbox**: no real
money moves. The Worker opens an Onramp session only for someone who signs
with one of an Arcveil account's three keys — `isMember`, read on Arc mainnet
— and only ever into that account. Refusals (stranger, stale, malformed, a
plain wallet) were exercised against the live chain; a sandbox session was
minted with the key. Not yet shown: a member-signed session through the page
to the widget, end to end. So the copy says *wired into* and *sandbox*, and
never *live*, *launched* or *fund your agent today*.

**Post only after** `wrangler secret put CIRCLE_API_KEY` is done and
`https://onramp.arcveil.dev/` answers 200 — until then the link in the post
opens a page whose button returns "not configured".

"Card or Apple Pay" describes what Onramp Kit does, as @arc's own post says.
Which methods the sandbox shows is Circle's; card, Apple Pay and Google Pay
need KYB in the Circle console before they appear at all.

---

## Main — quote post

> Fiat in. The mandate stays on.
>
> Onramp Kit is wired into Arcveil, on Circle's sandbox. It turns a card or Apple Pay into USDC on Arc, straight into the account your agent spends from.
>
> A session opens only for someone who signs with one of that account's keys, checked on Arc mainnet, and it can only pay into that account. The agent still cannot spend past its mandate.
>
> Sandbox, so no real money yet: arcveil.dev/fund

## Short — under 280

> Onramp Kit, wired into Arcveil on Circle's sandbox.
>
> Card or Apple Pay becomes USDC in the account your agent spends from. Only a key-holder can open it, and the agent still cannot spend past its mandate.
>
> No real money yet: arcveil.dev/fund

## First reply — the part people will ask about

> One thing it does not do: hide who paid in.
>
> Circle runs identity checks inside the widget, so money that arrives this way is tied to a person on Circle's side, even though the chain does not show it. The page says so above the button.
>
> The privacy is in what the agent can see and spend, not in where the money came from.

## Replies to expect

- *"Can I use it now?"* — On the sandbox, yes, if you hold an Arcveil account's key; nothing real moves. Production waits on KYB with Circle.
- *"Why sign anything to add money?"* — So the endpoint cannot be used to pay into arbitrary wallets under our integration. The destination comes from the signature, not the request.
- *"Why not onramp straight into the private bridge?"* — Because that would read as routing around the identity check, on Circle's own chain. We would rather say plainly where the privacy is and is not.

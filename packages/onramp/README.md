# @arcveil/onramp

Opens a Circle Onramp session — card, Apple Pay, Google Pay or bank transfer
into USDC on Arc — that can only pay into an Arcveil account.

## What it checks

`POST /sessions` with `{ account, issuedAt, signature }`:

1. `signature` is over the exact text in `src/message.ts`, which names the
   account, the chain and the moment. The page at `/fund` builds the same text
   (`src/lib/fundingMessage.ts`), and a test holds the two byte-identical.
2. `issuedAt` is within five minutes of the Worker's clock.
3. The recovered signer is one of the account's three keys — asked of the
   account itself on Arc mainnet (`isMember`). An address that is not an
   ArcveilAccount has no `isMember`, so it is refused.
4. Only then is a session minted, with `destinationAddress` set to the account
   the signature was checked against. Nothing in the request can change it.

So the endpoint cannot be used as a general onramp into arbitrary wallets, and
the worst a leaked signature does is let someone top up an account that is not
theirs, for five minutes.

## What it does not do

It does not hide who funded the account. Circle runs identity checks inside the
widget, so money that arrives this way is tied to a person on Circle's side,
even though the chain does not show it. It must not be chained into the
shielded pool as a way around that.

## Run it

Sandbox until KYB and a production key exist (`wrangler.jsonc` vars).

```bash
# packages/onramp/.dev.vars — gitignored. The full value from the Circle
# console, prefix included: TEST_API_KEY:<keyId>:<keySecret>
CIRCLE_API_KEY=TEST_API_KEY:...

pnpm --filter @arcveil/onramp dev --port 8788   # the Worker
pnpm dev                                         # the site; /fund
```

`.env.local` at the repo root points the page at the Worker and the sandbox
widget (`NEXT_PUBLIC_ONRAMP_URL`, `NEXT_PUBLIC_ONRAMP_WIDGET_BASE_URL`).

A key without its `<ENV>_API_KEY:` prefix is refused at startup with a message
that names the problem; Circle's own rejection of it does not say why.

Production is two URLs (`api.circle.com`, `onramp.arc.io`), a production key
via `wrangler secret put CIRCLE_API_KEY`, `ONRAMP_REFERRER_DOMAIN=arcveil.dev`
for card and Apple Pay in an iframe, `ONRAMP_ORIGIN=https://arcveil.dev`, and
a webhook receiver — browser events are UX signals, not settlement.

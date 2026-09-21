# The docs are live (2026-09-21)

Posts for `arcveil.dev/docs`, the 38-second film and the docs banner.

House rules carried over from the launch, pipeline, tech and gate rounds:
short declarative lines, no hashtags, no emoji, and nothing in the present
tense that is not shipped.

Assets: `banners/docs-live.png` (main), `video/docs/arcveil-docs.mp4` (film,
38 s, silent — see the note at the bottom before posting it).

Sources: `src/data/docs/*`, `packages/film/`, `docs/social/video/docs/storyboard.md`.

## The angle, and why it is not "the docs are live"

"It's finally live" is the worst-performing shape a product account can post —
it leads with the artifact and gives the reader nothing to do with it. The
thing worth saying is narrower and stranger: **writing the docs against the
source turned up a claim the product could not support, and the fix went into
the product instead of out of the docs.** That is a story. A table of contents
is not.

Every post below is built so a developer would save it: a field list, a verdict
table, two addresses they can paste into a block explorer.

---

## 01 · Main — the docs corrected the product → `banners/docs-live.png`

> We wrote the docs against the code instead of from memory, and the code won
> an argument.
>
> The SDK page said `pnpm add @arcveil/sdk`. That command fails — the package
> is not published. So the page now says it is not published, and the install
> section tells you to build it from the workspace.
>
> Five pages. The receipt field by field, the five checks, the SDK, and the
> contracts it reads on Arc.
>
> arcveil.dev/docs

---

## 02 · Alt main — shorter, sharper

Use this one if only a single post goes out.

> Docs are live. Read them before you trust us.
>
> The page that tells you how to install the SDK also tells you it is not on
> npm yet. The overview has two tables — what is live, and what is not — and
> the second one is longer.
>
> arcveil.dev/docs

---

## 03 · Film → `video/docs/arcveil-docs.mp4`

> Thirty-eight seconds on what a receipt is, what it refuses to carry, and the
> five checks that decide whether to believe it.
>
> Every field and both registry addresses on screen are imported from the
> site's own data. The film cannot quote a version of Arcveil that does not
> exist — if the docs change, it stops compiling.
>
> arcveil.dev/docs

Alt, if the build itself is the hook:

> The film reads the docs' source files at render time.
>
> `checks.ts`, `receipts.ts`, `site.ts` — the same objects the pages render.
> A contract address on screen is the one the verifier dials, because it is
> literally the same string.
>
> Built in Remotion. Two frames of it are art; the rest is React.

---

## 04 · Thread — eight tweets

The hook carries the thread; 2 and 3 carry the reader. Every tweet below is
written to stand alone, because most of them will be seen that way.

**1/**

> We wrote the Arcveil docs against the code instead of from memory, and the
> code won an argument.
>
> The SDK page printed an install command that fails. The fix went into the
> page, not the excuse.
>
> Here is what is in all five, and what is deliberately not.

**2/**

> A receipt is what one agent action leaves behind.
>
> 17 fields in v1. No amount. No asset. No balance. No threshold.
>
> It names the checks that ran. What they were set to stays in the mandate,
> which reaches the chain only as a hash.

**3/**

> Five checks decide whether to believe one.
>
> integrity — does the body still hash to its id
> signature — did the policy signer sign these bytes
> mandate — was that mandate live at that epoch
> linkage — does the budget chain join its predecessor
> settlement — did the transaction succeed
>
> Two are local. Three ask Arc.

**4/**

> There are three verdicts, not two.
>
> A check that cannot be asked at all returns unknown. Never pass, and never
> fail — a fail would read as "this receipt is forged", and an unreachable RPC
> is not evidence of forgery.
>
> Nothing in verification is allowed to fail open.

**5/**

> The three that read the chain read it from your browser.
>
> MandateRegistry 0xcd48ede31bd45d8fda65d5d24f8a6a317fd131f5
> AnchorRegistry 0xb2af157f269b31e315099e9da693096833ab8289
>
> Chain 5042. Arc's RPC allows cross-origin requests, so no backend of ours is
> in the path.

**6/**

> Verifying in code is about ten lines.
>
> Parse the receipt — anything arriving as text is untrusted until the schema
> says otherwise. Point a chain reader at Arc. Run the five checks. Read the
> worst verdict off the report.
>
> Same code in Node and in a browser.

**7/**

> The overview page has two tables. The second one is longer.
>
> Not built: the enclave. Not bound: cumulative spend in the budget chain. Not
> replaced: the attestation, where a zk proof will go. Not audited: any of it.
>
> A reader who finds that list late has been misled by everything before it.

**8/**

> Five pages, one sitting.
>
> arcveil.dev/docs
>
> If you only open one, open /docs/checks — it is the page that explains why
> the word "unknown" is doing more work than "pass".

---

## 05 · Replies to keep in the pocket

For "why isn't the SDK on npm":

> Because publishing it would make the install instruction true and the
> maturity claim false. It ships when the enclave it talks about exists.

For "is any of this audited":

> No. It says so on the overview page, on the closing frame of the film, and
> now here. Nothing is at stake on it yet, and that is on purpose.

For "what makes this different from a block explorer":

> An explorer shows that an action happened. A receipt shows that it stayed
> inside a mandate you never published. The second one needs the mandate to
> remain secret to mean anything.

---

## Notes before posting

**The film is silent.** The storyboard calls for one pad and it is not cut yet.
Silent video autoplays fine on X, but post 03 with the sound off is a choice —
either cut the pad first or accept it.

**Do not post 05's first reply without the main post.** On its own it reads as
an apology for a missing package rather than a position.

**Numbers in these posts are counted from `src/data/docs/*`** — 17 fields, five
pages, five checks, two addresses. If those files change, the posts are wrong.

**On the thread's closing tweet:** the usual advice is to end a thread by asking
for a bookmark and a repost. That is not this account's voice, so tweet 8 points
at one page instead. It will cost some saves; it keeps the register.

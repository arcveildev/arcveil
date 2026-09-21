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
> The SDK page said `pnpm add @arcveildev/sdk`, so we went and made that true.
> Then the first published version turned out to be unimportable from Node.
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
> The overview has two tables — what is live, and what is not. The second one
> is longer, and it stays that way until the enclave exists.
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
> Five pages, and a published SDK that we broke and fixed in the same day.
>
> Here is what is in all of it, and what is deliberately not.

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

For "why was 0.1.0 broken":

> Because every test we had ran on the source, and the source was fine. The
> tarball was not. Nothing we owned was looking at the thing we shipped.

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

---

# The SDK release (2026-09-21)

`@arcveildev/sdk@0.1.1` is on npm, published from CI with provenance. `0.1.0`
is deprecated and could not be imported at all.

That is the post. Not "the SDK is live" — an announcement nobody engages with —
but the four hours between the two versions, which is the only part a developer
learns anything from.

## 01 · Main — the tests were looking at the wrong thing

> We published the SDK. The first version could not be imported.
>
> 112 unit tests passed. Four typechecks passed. The site that depends on it
> built and deployed. All of them ran against the source, and the source was
> fine — the compiled tarball emitted extensionless relative imports, which
> resolve inside a bundler and nowhere else.
>
> Nothing we owned was looking at the thing we actually shipped.
>
> 0.1.1 fixes it. The release now installs its own package in a clean project
> and imports it before it is allowed to publish.
>
> @arcveildev/sdk · arcveil.dev/docs/sdk

## 02 · Alt — shorter

> Shipped an SDK. It didn't import.
>
> Every test we had ran on the source. The source was fine. The tarball was
> not, and the tarball is the product.
>
> 0.1.1 is out, and the release pipeline now has to install its own package
> before npm will take it.
>
> @arcveildev/sdk

## 03 · Provenance

> `@arcveildev/sdk` is published from CI with provenance, so the registry holds
> a signed statement binding the tarball to the commit and the workflow that
> built it.
>
> `npm audit signatures` checks it. For a package whose entire claim is that you
> can verify things yourself instead of trusting us, shipping one you had to
> take on trust would have been the wrong first artifact.

## 04 · Reply, for anyone who asks what we changed

> `moduleResolution: "bundler"` let the source import "./types" with no
> extension, and tsc emitted it verbatim. Node ESM needs "./types.js".
>
> The package compiles under NodeNext now, so a missing extension is a compile
> error rather than a silent one. That is the smaller half of the fix. The
> larger half is that CI packs the real tarball and imports it.

## Notes

Do not post 01 without 0.1.1 being installable — the whole post rests on the
fix existing. Verified before writing: a clean `npm install @arcveildev/sdk`
resolves 0.1.1, imports from Node, and verifies a real receipt against Arc
mainnet with all five checks passing.

No version numbers in these posts beyond 0.1.0 and 0.1.1, both of which are
real and on the registry.

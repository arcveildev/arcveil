# The semantic gate (2026-09-20)

Posts for the `typesafe/jev` integration. House rules carried over from the
launch, pipeline and tech rounds: short declarative lines, no hashtags, no
emoji, and nothing in the present tense that is not shipped.

**Live since 2026-09-21.** The gate answers at `gate.arcveil.dev` and the page
is at `arcveil.dev/gate`, so posts 01–04 close on that URL now. The earlier
"not deployed yet" lines are gone.

Sources: `docs/JUDGE.md`, `packages/sdk/src/judge.ts`,
`packages/sdk/src/selection.ts`, `packages/gate/`.

Occasion: @kleffew94's thread of 2026-09-20 asking who is putting Jev into
their x402 client, for tool selection and for payment guardrails.

---

## 01 · Main — the threshold never leaves

> A model that knows the passing grade can be argued toward it.
>
> So a mandate's semantic clauses send the question and keep the number.
> "Does this listing address the agent?" goes to the judge. The bar it has to
> clear never leaves the enclave.
>
> Jev answers with a calibrated probability. Code owns the threshold. The
> receipt carries the name of the check and nothing else.
>
> arcveil.dev/gate

---

## 02 · Alt main — the output channel → `banners/tech-injection.png`

Stronger hook, same build. Use this one if only one post goes out.

> Prompt injection works because the model can write the next instruction.
>
> A structured evaluation model cannot. Jev's only output is typed — a
> probability, a label, a point on a scale. Text that tries to hijack an agent
> can move the number. It cannot become a command.
>
> That is why the judgement clauses in an Arcveil mandate go to Jev and not to
> a chat model.
>
> arcveil.dev/gate

---

## 03 · Quote of @kleffew94's x402 thread

> Yes, with one change to the order.
>
> The mandate's price cap is applied before the request is built, so the judge
> never sees a tool it could talk the agent into buying. Only then does Jev
> score fit and whether the price is worth paying.
>
> A field with nothing affordable is refused without buying an opinion.
>
> gate.arcveil.dev

---

## 04 · The honest one

Every round carries one of these. It is not optional copy — it is the reason
the rest is believable.

> Four of a receipt's five checks can be re-run by a stranger. A judged check
> cannot.
>
> "Intent matched" held because a model said so and a threshold agreed. Nobody
> outside the gate can reproduce that, and our verifier does not pretend to —
> it reports the five it can actually decide.
>
> Calibration is a vendor's claim, not a proof. We would rather write that
> down than let a green tick imply otherwise.
>
> arcveil.dev/verify

---

## Thread, if all four go out

01 → 03 → 04, with 02 held back as its own post a few days later. Leading with
the injection line and following with the threshold line reads as one idea told
twice; splitting them gives each a week.


---

# Jev is live (2026-09-21)

The gate answers at `gate.arcveil.dev`, and the first full measurement is in.
Banners: `banners/dark-calibration-3d.png` (the render) and
`banners/dark-calibration.png` (the same numbers, CSS only, for when they move).

**What must never appear in these posts:** a threshold, a probability, a clean
floor or an attack ceiling. The corpus is public and the verdicts are public;
the numbers the verdicts were measured against are the mandate, and a bracket
around a threshold is the same leak as printing it.

**And one claim that is not available.** The gate is live and answering. No
production agent routes through it yet, so nothing here says it "guards every
action" or anything shaped like that. Live is true. Guarding is not, yet.

---

## 05 · Main — the announcement, with its own audit attached

> Cloudflare's Jev is live at Arcveil.
>
> It judges the clauses in a spending mandate that no threshold can express:
> is this venue's own listing addressing my agent, is this trade still what I
> asked for, is this destination one I named. The model answers with a
> calibrated probability. Our code holds the number it has to clear, and the
> model is never told what that number is.
>
> Built from 500 labelled proposals, 495 scored, 161 held out: 0 of 102
> attacks got through. 5 of 59 honest proposals were refused.
>
> gate.arcveil.dev

---

## 06 · The number that does not flatter

> Before it was measured, our gate refused 54 of 59 honest proposals.
>
> It also caught every single attack — and that is exactly what made it
> useless. A gate that blocks everything is not a safe gate. It is one you
> switch off by Friday.
>
> Six thresholds, set by hand. All six sat above the honest floor. Measuring
> them took one run over a labelled corpus and no new model calls, because the
> answers were already on disk.
>
> 54 refusals became 5. Attacks through, before and after: zero.
>
> arcveil.dev/gate

---

## 07 · The method one

> Most agent-safety numbers you read have no answer key.
>
> 500 proposals, each labelled with the verdict it should get and the clause
> that should produce it. Without that you can report how much a gate blocked
> and never whether it blocked the right things — and the number that matters
> most, an attack that got through, is invisible.
>
> Thirty percent held out, so the headline is not measured on what the
> thresholds were fitted to.
>
> The corpus is ours and synthetic, so a good score is evidence about this
> corpus and not a claim about the wild. It is published anyway.
>
> arcveil.dev/gate

---

## 08 · What is published and what is not

> We published the corpus. We published every verdict. We did not publish the
> thresholds, and we will not.
>
> The whole point of a mandate is a bar nobody outside can read. Publish the
> numbers beside the verdicts and anyone can solve for it, then price their
> way under it.
>
> So the benchmark is fully inspectable and the thing it measures against
> stays sealed. If that sounds like having it both ways, the clause set is
> hashed and the hash is in the repo.
>
> arcveil.dev/gate

---

## 09 · The bug that was not in the gate

> The first run said one of our clean proposals was only 0.69 fine. My
> instinct was that the question was badly worded.
>
> It was not. The corpus was. It paired an intent with an instruction drawn
> from a separate list, so "hold the current allocation" landed next to "swap
> 30% of the A position" — and I had labelled that *clean* without hesitating.
> The judge hesitated. The judge was right.
>
> An answer key you have not checked is not ground truth, it is a second
> opinion you already agree with.
>
> arcveil.dev/gate

---

## 10 · Reply to @kleffew94's x402 thread

> Yes, with one change to the order.
>
> The mandate's price cap is applied before the request is built, so the judge
> never sees a tool it could talk the agent into buying. Only then does Jev
> score fit and whether the price is worth paying.
>
> A field with nothing affordable is refused without buying an opinion.

---

## Which to post

05 is the announcement and goes first, with the render banner. 06 a day or two
later, with the same numbers and no announcement in it — it is the one that
earns the account something, because nobody else posts the number that makes
them look bad. 07 for whoever asks how it was measured. 08 only if someone
asks why the thresholds are not in the repo; it is an answer, not a news item.
09 is the most interesting and the least strategic. 10 is a reply, not a post.

Note that 05 and 06 carry the same two figures on purpose. 05 uses them as
evidence for a claim, 06 uses them as the claim. Posting 06 first would burn
the announcement.

# The iMessage concept film (2026-09-25)

Film: `video/imessage-concept/arcveil-in-the-chat.mp4` (25 s, 4:5).

House rules carried over: short declarative lines, no hashtags, no emoji, and
nothing in the present tense that is not shipped.

**What is shipped and what is not.** The iMessage agent is a concept: the relay
in `packages/imessage` is at phase 0 and only echoes; it moves no money. So
every line about the agent is future tense and the post says "concept" before
anything else. What *is* real, and may be said in the present tense: the
`/verify` page in beat 4 (it reads Arc mainnet in the browser), the mandate
and anchor registries on Arc mainnet, receipt format v1, and
`@arcveildev/sdk` on npm.

Occasion: a post saying that sending money over @arc with iMessage feels
smooth. Quote it if the link is to hand; the main post also stands alone.

---

## Main — quote post

> Smooth is half of it. The other half is proof.
>
> Concept, not shipped: your Arcveil agent, in iMessage.
>
> Text it like a friend. It will pay inside your mandate and answer with a receipt anyone can verify. Ask for more than you allowed and it will say no, naming the rule, never the limit.
>
> The verify page in the film is not a concept. It reads Arc mainnet today.
>
> arcveil.dev/verify

## Short — under 280, if the long form is not available

> Concept: your Arcveil agent, in iMessage.
>
> It will pay inside your mandate, reply with a receipt anyone can verify, and refuse anything past it without revealing the limit.
>
> The receipt check is already live on Arc mainnet: arcveil.dev/verify

## First reply — what is real today

Goes under the main post straight away, before anyone has to ask.

> What is real today, and what is not:
>
> Live: receipt format v1, the mandate and anchor registries on Arc mainnet, the in-browser verifier, and @arcveildev/sdk on npm.
>
> Not yet: the iMessage agent. The relay exists and moves no money. Every frame of the film says concept, and so does this.
>
> The first privacy layer for agents, built on @arc.

## Alt text for the video

> A 25-second concept film. In a sunlit café, someone texts an agent named Arcveil: "send 20 to sam for lunch". It replies "Sent 20 USDC to Sam. Inside your mandate." with a receipt link. The receipt opens on arcveil.dev/verify, where five checks read pass. They then ask it to send 500; it replies "Declined — this breaks per_action_cap. The limit itself stays private." End card: "Agents that can spend, never see, never exceed." Labelled "Concept · coming to iMessage".

## Replies to expect, and the answer

- *"So I can use this now?"* — Not yet. The verifier and the registries are live; the iMessage agent is the next thing being built. The film says concept for that reason.
- *"Is this iMessage or a mockup?"* — The chat is drawn in code to show the flow; no Apple software is in the film. The verify page is a capture of the live site.
- *"What does per_action_cap mean?"* — One clause of the mandate: a cap on a single action. The agent can name the clause it would break; the amount stays inside the mandate, which only reaches the chain as a commitment.

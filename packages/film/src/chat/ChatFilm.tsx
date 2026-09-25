import type { ReactNode } from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLOR, FONT } from "../theme";
import { EndCard } from "./EndCard";
import { Mono, Thread, heightOf, type Composer, type Item } from "./Thread";
import { CHAT_BEATS, CONCEPT_UNTIL, FRIEND, at } from "./timing";
import { Verify } from "./Verify";

const friend = FRIEND.toLowerCase();

// Beat 2: the payment. Frames are local to the beat.
const TYPING_1 = { id: "t1", kind: "typing", at: 70, until: 96 } as const;
const SEND_ITEMS: readonly Item[] = [
  { id: "stamp", kind: "stamp", text: "Today 9:41", at: -1 },
  { id: "me1", kind: "me", lines: [`send 20 to ${friend} for lunch`], at: 58 },
  TYPING_1,
  { id: "them1", kind: "them", lines: [`Sent 20 USDC to ${FRIEND}.`, "Inside your mandate."], at: 96, replaces: heightOf(TYPING_1) },
  { id: "card", kind: "card", at: 112 },
];
const SEND_COMPOSER: Composer = { text: `send 20 to ${friend} for lunch`, from: 8, to: 50, sendAt: 58 };

// Beat 5: the refusal, continuing the same thread.
const TYPING_2 = { id: "t2", kind: "typing", at: 52, until: 78 } as const;
const REFUSE_ITEMS: readonly Item[] = [
  ...SEND_ITEMS.map((item) => ({ ...item, at: -200 })).filter((item) => item.kind !== "typing"),
  { id: "me2", kind: "me", lines: [`send 500 to ${friend}`], at: 42 },
  TYPING_2,
  { id: "them2", kind: "them", lines: ["Declined — this breaks", <Mono key="cap">per_action_cap</Mono>], at: 78, replaces: heightOf(TYPING_2) },
  { id: "them3", kind: "them", lines: ["The limit itself stays private."], at: 100 },
];
const REFUSE_COMPOSER: Composer = { text: `send 500 to ${friend}`, from: 6, to: 34, sendAt: 42 };

/** Sound: room tone under everything, and our own soft cues — never Messages' sounds. */
const CUES: readonly { at: number; src: "send" | "tick" }[] = [
  { at: at(2.5) + 58, src: "send" },
  { at: at(2.5) + 96, src: "tick" },
  { at: at(2.5) + 112, src: "tick" },
  { at: at(8) + 16, src: "tick" }, // the finger lands on the card
  { at: at(14.5) + 42, src: "send" },
  { at: at(14.5) + 78, src: "tick" },
  { at: at(14.5) + 100, src: "tick" },
];

const Plate = ({ src, startFrom = 0 }: { src: string; startFrom?: number }) => (
  <OffthreadVideo src={staticFile(src)} startFrom={startFrom} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
);

const ConceptTag = () => (
  // Bottom centre, in the phone's home-indicator strip: clear of the clock and every message.
  <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", fontFamily: FONT.mono, fontSize: 24, letterSpacing: "0.14em", color: COLOR.ink, background: "rgba(255,255,255,.86)", padding: "8px 16px", borderRadius: 6 }}>
    CONCEPT
  </div>
);

const END_FADE = 10;

const FadeIn = ({ frames, children }: { frames: number; children: ReactNode }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [0, frames], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};

const BEAT = {
  open: () => <Plate src="chat/p1-cut.mp4" />,
  send: () => <Thread items={SEND_ITEMS} composer={SEND_COMPOSER} />,
  // The composited test plate: finger lands at 2.2 s of it, lifts at 3.55 s.
  tap: () => <Plate src="chat/p2-test.mp4" startFrom={at(1.7)} />,
  verify: () => <Verify />,
  refuse: () => <Thread items={REFUSE_ITEMS} composer={REFUSE_COMPOSER} />,
  close: () => <Plate src="chat/p3-cut.mp4" />,
  end: () => (
    <FadeIn frames={END_FADE}>
      <EndCard />
    </FadeIn>
  ),
} as const;

export const ChatFilm = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {CHAT_BEATS.map((beat) => {
      const Component = BEAT[beat.id];
      return (
        // The coffee shot runs under the end card's fade instead of cutting to black first.
        <Sequence key={beat.id} name={beat.id} from={at(beat.at)} durationInFrames={at(beat.for) + (beat.id === "close" ? END_FADE : 0)}>
          <Component />
        </Sequence>
      );
    })}
    <Sequence name="concept tag" durationInFrames={CONCEPT_UNTIL}>
      <ConceptTag />
    </Sequence>
    <Audio src={staticFile("chat/room.wav")} volume={0.9} />
    {CUES.map((cue, i) => (
      <Sequence key={i} from={cue.at} durationInFrames={10}>
        <Audio src={staticFile(`chat/${cue.src}.wav`)} volume={0.55} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

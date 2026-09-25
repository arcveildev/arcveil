import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

/**
 * A chat on an iPhone, drawn in code so every character is exact. Styled to
 * read as Messages; it is not Messages — no Apple icon, no Apple sound.
 * Sizes are iOS points times K, the scale of a 390-point screen at 1080 px.
 */
const K = 1080 / 390;
const pt = (n: number) => n * K;

const IOS = "-apple-system, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif";
const BLUE = "#0a84ff";
const GREY = "#e9e9eb";
const INK = "#111111";
const MUTED = "#8a8a8e";
const HAIR = "#dedee2";
const CORAL = "#e5484d";

const BODY = pt(17);
const LINE = pt(22);
const PAD_X = pt(12);
const PAD_Y = pt(7);
const GAP = pt(4);

export type Item =
  | { id: string; kind: "stamp"; text: string; at: number }
  | { id: string; kind: "me" | "them"; lines: readonly ReactNode[]; at: number; replaces?: number }
  | { id: string; kind: "typing"; at: number; until: number }
  | { id: string; kind: "card"; at: number };

/** Heights in px, so the column can push up smoothly as items land. */
export const heightOf = (item: Item): number => {
  switch (item.kind) {
    case "stamp":
      return pt(26);
    case "typing":
      return LINE + 2 * PAD_Y;
    case "card":
      return pt(62);
    default:
      return item.lines.length * LINE + 2 * PAD_Y;
  }
};

export type Composer = { text: string; from: number; to: number; sendAt: number };

const visible = (item: Item, frame: number) =>
  frame >= item.at && (item.kind !== "typing" || frame < item.until);

const Bubble = ({ mine, children }: { mine: boolean; children: ReactNode }) => (
  <div
    style={{
      alignSelf: mine ? "flex-end" : "flex-start",
      maxWidth: "76%",
      background: mine ? BLUE : GREY,
      color: mine ? "#fff" : INK,
      fontFamily: IOS,
      fontSize: BODY,
      lineHeight: `${LINE}px`,
      padding: `${PAD_Y}px ${PAD_X}px`,
      borderRadius: pt(18),
      letterSpacing: "-0.01em",
    }}
  >
    {children}
  </div>
);

const Dots = ({ frame }: { frame: number }) => (
  <div style={{ display: "flex", gap: pt(4), height: LINE, alignItems: "center" }}>
    {[0, 1, 2].map((i) => {
      const phase = ((frame - i * 5) % 24) / 24;
      const o = 0.35 + 0.65 * Math.max(0, Math.sin(phase * Math.PI));
      return <div key={i} style={{ width: pt(7), height: pt(7), borderRadius: "50%", background: MUTED, opacity: o }} />;
    })}
  </div>
);

const Card = ({ pressed }: { pressed: boolean }) => (
  <div
    style={{
      alignSelf: "flex-start",
      width: "74%",
      height: pt(62) - GAP,
      display: "flex",
      borderRadius: pt(14),
      overflow: "hidden",
      background: pressed ? "#d6d8de" : "#f3f4f6",
    }}
  >
    <div style={{ width: pt(5), background: COLOR.mint }} />
    <div style={{ padding: `${pt(10)}px ${pt(12)}px`, display: "flex", flexDirection: "column", gap: pt(3) }}>
      <span style={{ fontFamily: IOS, fontSize: pt(16), fontWeight: 600, color: INK }}>Receipt · 5 checks</span>
      <span style={{ fontFamily: FONT.mono, fontSize: pt(13), color: MUTED }}>arcveil.dev/verify</span>
    </div>
  </div>
);

const StatusBar = () => (
  <div
    style={{
      height: pt(50),
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `0 ${pt(30)}px`,
      fontFamily: IOS,
      fontWeight: 600,
      fontSize: pt(16),
      color: INK,
    }}
  >
    <span>9:41</span>
    <span style={{ display: "flex", gap: pt(6), alignItems: "center" }}>
      <span style={{ display: "flex", gap: pt(2), alignItems: "flex-end" }}>
        {[5, 7, 9, 11].map((h) => (
          <span key={h} style={{ width: pt(3), height: pt(h), background: INK, borderRadius: 1 }} />
        ))}
      </span>
      <span style={{ width: pt(24), height: pt(11), border: `${pt(1)}px solid ${INK}`, borderRadius: pt(3), padding: pt(1.5) }}>
        <span style={{ display: "block", width: "80%", height: "100%", background: INK, borderRadius: pt(1.5) }} />
      </span>
    </span>
  </div>
);

const Header = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: pt(4), paddingBottom: pt(8), borderBottom: `1px solid ${HAIR}` }}>
    <div style={{ width: pt(50), height: pt(50), borderRadius: "50%", background: COLOR.ink, display: "grid", placeItems: "center" }}>
      <svg viewBox="0 0 28 24" style={{ width: pt(26) }} fill="none">
        <path d="M3.1 10.5A11 11 0 0 1 24.9 10.5L18.77 10.5A5 5 0 0 0 9.23 10.5Z" fill="#fff" />
        <rect x="3" y="14" width="6" height="9" fill="#fff" />
        <rect x="19" y="14" width="6" height="9" fill="#fff" />
        <rect y="11.25" width="28" height="2" fill={COLOR.mint} />
      </svg>
    </div>
    <span style={{ fontFamily: IOS, fontSize: pt(12), color: INK }}>Arcveil ›</span>
  </div>
);

const ComposeBar = ({ composer, frame }: { composer?: Composer; frame: number }) => {
  let typed = "";
  if (composer && frame < composer.sendAt) {
    const n = Math.floor(interpolate(frame, [composer.from, composer.to], [0, composer.text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    typed = composer.text.slice(0, n);
  }
  const caret = Math.floor(frame / 15) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "#fff", padding: `${pt(8)}px ${pt(12)}px ${pt(30)}px`, display: "flex", gap: pt(8), alignItems: "center" }}>
      <div style={{ width: pt(34), height: pt(34), borderRadius: "50%", background: "#f0f0f2", display: "grid", placeItems: "center", color: MUTED, fontFamily: IOS, fontSize: pt(22) }}>+</div>
      <div style={{ flex: 1, minHeight: pt(36), border: `1px solid ${HAIR}`, borderRadius: pt(18), display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${pt(4)}px 0 ${pt(14)}px`, fontFamily: IOS, fontSize: BODY }}>
        <span style={{ color: typed ? INK : MUTED }}>
          {typed || "Message"}
          {typed && caret ? <span style={{ color: BLUE }}>|</span> : null}
        </span>
        {typed ? (
          <span style={{ width: pt(28), height: pt(28), borderRadius: "50%", background: BLUE, color: "#fff", display: "grid", placeItems: "center", fontSize: pt(17), fontWeight: 700 }}>↑</span>
        ) : null}
      </div>
    </div>
  );
};

/** The thread, bottom-anchored like a real one; each landing item pushes the rest up. */
export const Thread = ({ items, composer, pressedCard = false }: { items: readonly Item[]; composer?: Composer; pressedCard?: boolean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shown = items.filter((item) => visible(item, frame));
  const lift = shown.reduce((sum, item) => {
    const p = spring({ frame: frame - item.at, fps, config: { damping: 18, stiffness: 170 } });
    const grows = heightOf(item) + GAP - (item.kind === "me" || item.kind === "them" ? (item.replaces ?? 0) : 0);
    return sum + (1 - p) * grows;
  }, 0);

  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <div style={{ position: "absolute", left: pt(12), right: pt(12), bottom: pt(84), display: "flex", flexDirection: "column", gap: GAP, transform: `translateY(${lift}px)` }}>
        {shown.map((item) => {
          switch (item.kind) {
            case "stamp":
              return (
                <div key={item.id} style={{ height: heightOf(item) - GAP, textAlign: "center", fontFamily: IOS, fontSize: pt(12), color: MUTED }}>
                  {item.text}
                </div>
              );
            case "typing":
              return (
                <Bubble key={item.id} mine={false}>
                  <Dots frame={frame} />
                </Bubble>
              );
            case "card":
              return <Card key={item.id} pressed={pressedCard} />;
            default:
              return (
                <Bubble key={item.id} mine={item.kind === "me"}>
                  {item.lines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </Bubble>
              );
          }
        })}
      </div>
      {/* Drawn after the list so older messages slide under it, as they do on a phone. */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: "#fff" }}>
        <StatusBar />
        <Header />
      </div>
      <ComposeBar composer={composer} frame={frame} />
    </AbsoluteFill>
  );
};

export const Mono = ({ children }: { children: ReactNode }) => (
  <span style={{ fontFamily: FONT.mono, color: CORAL, fontSize: pt(16) }}>{children}</span>
);

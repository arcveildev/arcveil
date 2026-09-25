import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT } from "../theme";
import { Lockup } from "../ui/Lockup";

const rise = (frame: number, from: number) => ({
  opacity: interpolate(frame, [from, from + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  transform: `translateY(${interpolate(frame, [from, from + 12], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
});

/** The real mark, the positioning line, and the label that says what this film is. */
export const EndCard = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COLOR.ground, alignItems: "center", justifyContent: "center", gap: 64 }}>
      <div style={rise(frame, 4)}>
        <Lockup size={1.5} />
      </div>
      <div style={{ ...rise(frame, 12), fontFamily: FONT.sans, fontWeight: 600, fontSize: 64, lineHeight: 1.12, letterSpacing: "-0.02em", color: COLOR.ink, textAlign: "center" }}>
        Agents that can spend,
        <br />
        never see, never exceed.
      </div>
      <div style={{ ...rise(frame, 22), display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <span style={{ fontFamily: FONT.mono, fontSize: 26, letterSpacing: "0.12em", color: COLOR.ink, border: `2px solid ${COLOR.ink}`, borderRadius: 999, padding: "12px 28px" }}>
          CONCEPT · COMING TO iMESSAGE
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: 30, color: COLOR.ink2 }}>arcveil.dev</span>
      </div>
    </AbsoluteFill>
  );
};

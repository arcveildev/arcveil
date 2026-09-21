import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLOR, FONT } from "../theme";
import { Lockup } from "../ui/Lockup";

export const Closer = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 12, 100, 120], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drift = interpolate(frame, [0, 120], [1.0, 1.05]);

  return (
    <AbsoluteFill style={{ background: COLOR.ground, opacity: fade }}>
      <Img
        src={staticFile("plate-close.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${drift})` }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 34,
          background: "rgba(246,244,240,.72)",
          opacity: interpolate(frame, [8, 26], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <Lockup size={1.2} />
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 44,
            color: COLOR.ink,
            background: COLOR.ink,
            borderRadius: 999,
            padding: "16px 34px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: 6, background: COLOR.mint }} />
          <span style={{ color: "#fff" }}>arcveil.dev/docs</span>
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 24, color: COLOR.ink2 }}>
          unaudited · no enclave yet · nothing is at stake
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

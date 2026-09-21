import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLOR, FONT } from "../theme";
import { Lockup } from "../ui/Lockup";

/**
 * One of the two Higgsfield plates in the whole film — the meadow the banners
 * and both earlier films live in, so this one is recognisably the same product.
 */
export const Opener = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 12, 78, 90], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drift = interpolate(frame, [0, 90], [1.06, 1.0]);

  return (
    <AbsoluteFill style={{ background: COLOR.ground, opacity: fade }}>
      <Img
        src={staticFile("plate-open.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${drift})` }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: 96,
          background: "linear-gradient(to top, rgba(246,244,240,.92), rgba(246,244,240,0) 46%)",
        }}
      >
        <div style={{ opacity: interpolate(frame, [18, 34], [0, 1], { extrapolateRight: "clamp" }) }}>
          <Lockup />
          <div
            style={{
              marginTop: 22,
              fontFamily: FONT.mono,
              fontSize: 30,
              color: COLOR.ink2,
              letterSpacing: "0.02em",
            }}
          >
            Agents that can spend, and never see.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

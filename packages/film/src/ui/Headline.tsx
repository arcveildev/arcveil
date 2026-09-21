import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

/**
 * A centred headline in three parts, so the accent word can carry a mint rule
 * that wipes in under it once the words have settled. The reference film
 * underlines exactly one word per beat; more than one and the beat says two
 * things.
 */
export const Headline = ({
  before,
  accent,
  after,
  delay = 0,
  size = 92,
}: {
  before?: string;
  accent?: string;
  after?: string;
  delay?: number;
  size?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 18 });
  const rule = interpolate(frame - delay, [14, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        color: COLOR.ink,
        textAlign: "center",
        maxWidth: 1400,
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [18, 0])}px)`,
      }}
    >
      {before}
      {accent !== undefined && (
        <span style={{ position: "relative", whiteSpace: "nowrap" }}>
          {accent}
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -14,
              height: 8,
              borderRadius: 4,
              background: COLOR.mint,
              transform: `scaleX(${rule})`,
              transformOrigin: "left center",
            }}
          />
        </span>
      )}
      {after}
    </div>
  );
};

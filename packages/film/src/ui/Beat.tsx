import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";

/**
 * One beat of the film. Holds the ground colour and the short fade the earlier
 * films use at every cut, so no beat has to animate its own entrance twice.
 */
export const Beat = ({
  children,
  fade = 8,
  background = COLOR.ground,
}: {
  children: ReactNode;
  /** Frames of fade at each end of the beat. */
  fade?: number;
  background?: string;
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, fade, durationInFrames - fade, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background, opacity, justifyContent: "center", alignItems: "center" }}>
      {children}
    </AbsoluteFill>
  );
};

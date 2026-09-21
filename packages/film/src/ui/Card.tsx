import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

/** The floating product card the reference film leans on, in our own hairlines. */
export const Card = ({
  children,
  title,
  badge,
  width = 1180,
  delay = 0,
  style,
}: {
  children: ReactNode;
  title?: string;
  badge?: string;
  width?: number;
  delay?: number;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 20 });

  return (
    <div
      style={{
        width,
        background: COLOR.card,
        borderRadius: 20,
        boxShadow: "0 40px 80px -32px rgba(27,49,88,.35)",
        border: `1px solid ${COLOR.hair}`,
        overflow: "hidden",
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [26, 0])}px) scale(${interpolate(enter, [0, 1], [0.985, 1])})`,
        ...style,
      }}
    >
      {title !== undefined && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "18px 28px",
            borderBottom: `1px solid ${COLOR.hair}`,
            fontFamily: FONT.mono,
            fontSize: 20,
            letterSpacing: "0.04em",
            color: COLOR.ink2,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 5, background: COLOR.accent }} />
          {title}
          {badge !== undefined && (
            <span
              style={{
                marginLeft: "auto",
                background: "rgba(133,237,117,.36)",
                color: COLOR.ink,
                padding: "4px 14px",
                borderRadius: 999,
                fontSize: 18,
              }}
            >
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

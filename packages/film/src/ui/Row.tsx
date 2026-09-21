import type { ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";

export type RowTone = "plain" | "mint" | "amber";

const TONE = {
  plain: { background: "transparent", bar: "transparent", ink: COLOR.ink },
  mint: { background: "rgba(133,237,117,.16)", bar: COLOR.accent, ink: COLOR.accent },
  amber: { background: "rgba(182,118,31,.10)", bar: COLOR.amber, ink: COLOR.amber },
} as const;

/** One line of a card, landing on its own beat. */
export const Row = ({
  left,
  middle,
  right,
  delay = 0,
  tone = "plain",
  struck = false,
  columns = "260px 1fr 320px",
}: {
  left: ReactNode;
  middle?: ReactNode;
  right?: ReactNode;
  delay?: number;
  tone?: RowTone;
  /** Drawn, then crossed out and lifted away — see beat 3. */
  struck?: boolean;
  columns?: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 14 });
  const t = TONE[tone];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: columns,
        alignItems: "baseline",
        gap: 24,
        padding: "20px 28px",
        borderBottom: `1px solid ${COLOR.hair}`,
        background: t.background,
        boxShadow: tone === "plain" ? undefined : `inset 3px 0 0 ${t.bar}`,
        opacity: enter * (struck ? 0.42 : 1),
        transform: `translateX(${interpolate(enter, [0, 1], [-16, 0])}px)`,
        textDecoration: struck ? "line-through" : undefined,
        textDecorationColor: struck ? COLOR.amber : undefined,
        textDecorationThickness: struck ? 3 : undefined,
      }}
    >
      <span style={{ fontFamily: FONT.mono, fontSize: 24, color: tone === "plain" ? COLOR.ink : t.ink }}>
        {left}
      </span>
      {middle !== undefined && (
        <span style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 26, color: COLOR.ink }}>{middle}</span>
      )}
      {right !== undefined && (
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 22,
            color: tone === "amber" ? COLOR.amber : COLOR.ink2,
            textAlign: "right",
          }}
        >
          {right}
        </span>
      )}
    </div>
  );
};

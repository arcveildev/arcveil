import { COLOR, FONT } from "../theme";

/** The arch mark and wordmark, the same drawing the banners carry. */
export const Lockup = ({ size = 1, color = COLOR.ink }: { size?: number; color?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 * size }}>
    <svg viewBox="0 0 28 24" style={{ height: 46 * size, width: "auto", color }} fill="none">
      <path d="M3.1 10.5A11 11 0 0 1 24.9 10.5L18.77 10.5A5 5 0 0 0 9.23 10.5Z" fill="currentColor" />
      <rect x="3" y="14" width="6" height="9" fill="currentColor" />
      <rect x="19" y="14" width="6" height="9" fill="currentColor" />
      <rect y="11.25" width="28" height="2" fill={COLOR.mint} />
    </svg>
    <span
      style={{
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize: 42 * size,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color,
      }}
    >
      Arcveil
    </span>
  </div>
);

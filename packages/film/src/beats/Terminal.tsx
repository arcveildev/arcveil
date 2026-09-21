import { interpolate, useCurrentFrame } from "remotion";
import { COLOR, FONT } from "../theme";
import { Beat } from "../ui/Beat";

const LINES = [
  { text: "const report = await verifyReceipts(parsed.receipts, { chain });", tone: "code" },
  { text: "", tone: "code" },
  { text: "report.status", tone: "code" },
  { text: '"pass"', tone: "out" },
] as const;

/** Types the quickstart from /docs/sdk, one character at a time. */
export const Terminal = () => {
  const frame = useCurrentFrame();
  const typed = Math.max(0, Math.floor(interpolate(frame, [14, 96], [0, 96], { extrapolateRight: "clamp" })));

  // Each line starts where the ones before it end, so the caret walks the block
  // as one stream. Offsets are derived rather than accumulated in a mutable
  // counter: nothing may be reassigned while Remotion is rendering a frame.
  const starts = LINES.reduce<readonly number[]>(
    (acc, line) => [...acc, (acc[acc.length - 1] ?? 0) + line.text.length],
    [0],
  );

  const shown = LINES.map((line, i) => {
    const take = Math.max(0, Math.min(line.text.length, typed - (starts[i] ?? 0)));
    return { ...line, visible: line.text.slice(0, take), done: take === line.text.length };
  });

  return (
    <Beat>
      <div
        style={{
          width: 1320,
          background: "#101722",
          borderRadius: 20,
          padding: "44px 52px",
          boxShadow: "0 40px 80px -32px rgba(27,49,88,.45)",
          fontFamily: FONT.mono,
          fontSize: 30,
          lineHeight: 1.7,
        }}
      >
        {shown.map((line, i) => (
          <div key={i} style={{ color: line.tone === "out" ? COLOR.mint : "#e8eef7", minHeight: 44 }}>
            {line.visible}
            {!line.done && line.visible.length > 0 && (
              <span style={{ opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0 }}>▌</span>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: FONT.mono,
          fontSize: 26,
          color: COLOR.ink2,
          opacity: interpolate(frame, [100, 116], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Two checks are local crypto. Three ask the chain.
      </div>
    </Beat>
  );
};

import { COLOR, FONT } from "../theme";
import { Beat } from "../ui/Beat";
import { Card } from "../ui/Card";
import { Headline } from "../ui/Headline";
import { Row } from "../ui/Row";

/**
 * Beat 3, the one that earns the film. Four rows a reader expects are drawn in
 * the same hand as the real ones, then crossed out — the absence is shown
 * rather than described.
 */
const NEVER = [
  { key: "amount", note: "never in a receipt" },
  { key: "asset", note: "never in a receipt" },
  { key: "balance", note: "never in a receipt" },
  { key: "threshold", note: "never in a receipt" },
] as const;

export const Redact = () => (
  <Beat>
    <Headline before="It proves the mandate held — " accent="without revealing it" after="." size={76} />
    <Card title="what a receipt refuses to carry" width={1180} delay={14} style={{ marginTop: 72 }}>
      <div style={{ padding: "6px 0" }}>
        {NEVER.map((row, i) => (
          <Row
            key={row.key}
            left={row.key}
            right={row.note}
            tone="amber"
            struck
            delay={20 + i * 6}
            columns="420px 1fr 320px"
          />
        ))}
      </div>
      <div
        style={{
          padding: "22px 28px",
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 30,
          color: COLOR.ink,
          borderTop: `1px solid ${COLOR.hair}`,
        }}
      >
        None of these were ever in it.
      </div>
    </Card>
  </Beat>
);

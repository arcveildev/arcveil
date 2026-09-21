import { COLOR, FONT } from "../theme";
import { Beat } from "../ui/Beat";
import { Card } from "../ui/Card";
import { Headline } from "../ui/Headline";
import { Row } from "../ui/Row";

/**
 * The film's beat 6 equivalent from the proof storyboard: four seconds spent
 * on what is not built, so the other eight beats cannot be over-read.
 */
const NOT_YET = [
  { key: "@arcveildev/sdk", note: "not on npm — a workspace package" },
  { key: "enclave", note: "designed, not built" },
  { key: "zk proof", note: "planned; the format does not change" },
  { key: "audit", note: "none. nothing is at stake yet" },
] as const;

export const Honest = () => (
  <Beat>
    <Headline accent="Not on npm yet" after="." />
    <Card title="what the docs say before they say anything else" width={1180} delay={14} style={{ marginTop: 72 }}>
      <div style={{ padding: "6px 0" }}>
        {NOT_YET.map((row, i) => (
          <Row key={row.key} left={row.key} middle={row.note} tone="amber" delay={20 + i * 8} columns="420px 1fr" />
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
        The page that tells you to install it says so too.
      </div>
    </Card>
  </Beat>
);

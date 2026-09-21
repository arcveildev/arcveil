import { COLOR, FONT } from "../theme";
import { Beat } from "../ui/Beat";
import { Card } from "../ui/Card";
import { Headline } from "../ui/Headline";
import { Row } from "../ui/Row";

/** The third verdict, alone on the frame, because it is the one that matters. */
export const Unknown = () => (
  <Beat>
    <Headline before="A check that cannot decide returns " accent="unknown" after="." size={72} />
    <Card width={1080} delay={14} style={{ marginTop: 64 }}>
      <div style={{ padding: "6px 0" }}>
        <Row left="pass" middle="The check ran, and the answer was yes." tone="mint" delay={20} columns="260px 1fr" />
        <Row left="fail" middle="The check ran, and the answer was no." delay={28} columns="260px 1fr" />
        <Row left="unknown" middle="The check could not be asked at all." tone="amber" delay={36} columns="260px 1fr" />
      </div>
      <div
        style={{
          padding: "22px 28px",
          fontFamily: FONT.mono,
          fontSize: 24,
          color: COLOR.ink2,
          borderTop: `1px solid ${COLOR.hair}`,
        }}
      >
        Never a pass, and never a fail — which would read as “this receipt is forged”.
      </div>
    </Card>
  </Beat>
);

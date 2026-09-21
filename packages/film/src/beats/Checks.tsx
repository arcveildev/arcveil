import { CHECK_DOCS } from "@site/data/docs/checks";
import { Beat } from "../ui/Beat";
import { Card } from "../ui/Card";
import { Headline } from "../ui/Headline";
import { Row } from "../ui/Row";

/** The five rows, straight from the page they advertise. */
export const Checks = () => (
  <Beat>
    <Headline accent="Five checks" after="." />
    <Card title="one receipt, five questions" width={1280} delay={14} style={{ marginTop: 72 }}>
      <div style={{ padding: "6px 0" }}>
        {CHECK_DOCS.map((check, i) => (
          <Row
            key={check.id}
            left={check.id}
            middle={check.question}
            right={check.where}
            delay={20 + i * 8}
            columns="240px 1fr 220px"
          />
        ))}
      </div>
    </Card>
  </Beat>
);

import { FIELD_ROWS } from "@site/data/docs/receipts";
import { COLOR, FONT } from "../theme";
import { Beat } from "../ui/Beat";
import { Card } from "../ui/Card";
import { Headline } from "../ui/Headline";
import { Row } from "../ui/Row";

/** The nine top-level members of a v1 receipt, named from the docs' own table. */
/** Field name to the shape it carries. Keys are checked against the docs table below. */
const SHOWN = [
  { key: "v", shape: "1" },
  { key: "id", shape: "sha256 of the body" },
  { key: "chain", shape: "5042" },
  { key: "account", shape: "20 bytes" },
  { key: "mandate.commitment", shape: "32 bytes" },
  { key: "agent.id", shape: "32 bytes" },
  { key: "action.settledTx", shape: "32 bytes" },
  { key: "checks", shape: "names only" },
  { key: "counter.prev / next", shape: "32 bytes each" },
] as const;

/** A name that is not in the published table would be the film inventing a field. */
const known = (key: string) => FIELD_ROWS.some((row) => row.key === key);

export const Receipt = () => (
  <Beat>
    <Headline before="Every action leaves a " accent="receipt" after="." />
    <Card
      title="receipt v1"
      badge="ARC · 5042"
      width={1180}
      delay={16}
      style={{ marginTop: 72 }}
    >
      <div style={{ padding: "6px 0" }}>
        {SHOWN.map((field, i) => (
          <Row
            key={field.key}
            left={field.key}
            right={known(field.key) ? field.shape : "not a v1 field"}
            delay={22 + i * 4}
            columns="460px 1fr 320px"
          />
        ))}
      </div>
      <div
        style={{
          padding: "20px 28px",
          fontFamily: FONT.mono,
          fontSize: 22,
          color: COLOR.ink2,
          borderTop: `1px solid ${COLOR.hair}`,
        }}
      >
        Names only. What each check was set to stays in the mandate.
      </div>
    </Card>
  </Beat>
);

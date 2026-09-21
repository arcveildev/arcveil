import { ARC, CHAIN } from "@site/data/site";
import { COLOR, FONT } from "../theme";
import { Beat } from "../ui/Beat";
import { Card } from "../ui/Card";
import { Headline } from "../ui/Headline";
import { Row } from "../ui/Row";

/** Addresses come from the site's own config, so the film cannot quote a stale one. */
export const Chain = () => (
  <Beat>
    <Headline before="Three of them read " accent="Arc mainnet" after="." />
    <Card title={`chain ${CHAIN.id} · ${CHAIN.gas} is the gas`} width={1380} delay={14} style={{ marginTop: 72 }}>
      <div style={{ padding: "6px 0" }}>
        <Row left="MandateRegistry" right={ARC.mandateRegistry ?? "—"} delay={20} columns="380px 1fr 780px" />
        <Row left="AnchorRegistry" right={ARC.anchorRegistry ?? "—"} delay={28} columns="380px 1fr 780px" />
        <Row left="ArcveilAccount" right={ARC.account ?? "—"} delay={36} columns="380px 1fr 780px" />
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
        Read from your browser. No backend of ours is in the path.
      </div>
    </Card>
  </Beat>
);

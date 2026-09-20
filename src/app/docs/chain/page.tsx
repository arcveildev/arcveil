import type { Metadata } from "next";
import { DefTable } from "@/components/docs/DefTable";
import { DocsHeader } from "@/components/docs/DocsHeader";
import { DocsPager } from "@/components/docs/DocsPager";
import { DocsProse, DocsSection } from "@/components/docs/DocsSection";
import { Note } from "@/components/docs/Note";
import { Snippet } from "@/components/docs/Snippet";
import {
  ACCOUNT_ROWS,
  ANCHOR_FUNCTIONS,
  CHAIN_PAGE,
  CLI_NOTE,
  CLI_SNIPPET,
  CONTRACT_ROWS,
  DECIMALS_NOTE,
  MANDATE_FUNCTIONS,
  NETWORK_ROWS,
  READER_SNIPPET,
} from "@/data/docs/chain";

export const metadata: Metadata = {
  title: "Arc and contracts",
  description: CHAIN_PAGE.lede,
  alternates: { canonical: "/docs/chain" },
};

export default function ChainPage() {
  return (
    <>
      <DocsHeader
        label={CHAIN_PAGE.label}
        title={CHAIN_PAGE.title}
        tagline={CHAIN_PAGE.tagline}
        lede={CHAIN_PAGE.lede}
      />

      <DocsSection id="network" title="Network">
        <DefTable rows={NETWORK_ROWS} caption="Arc network parameters the verifier uses." />
        <Note title="Two USDC decimals" tone="warn">
          {DECIMALS_NOTE}
        </Note>
      </DocsSection>

      <DocsSection id="addresses" title="Deployed">
        <DocsProse>
          On Arc mainnet. The registry bytecode was checked byte-identical to the local build, so
          what answers at these addresses is what the test suite ran against.
        </DocsProse>
        <DefTable rows={CONTRACT_ROWS} caption="Arcveil contracts deployed to Arc mainnet." />
      </DocsSection>

      <DocsSection id="mandate-registry" title="MandateRegistry">
        <DocsProse>
          Holds one commitment per account per epoch, and whether it has been revoked. It never
          holds terms — only their hash.
        </DocsProse>
        <DefTable
          rows={MANDATE_FUNCTIONS}
          head={["Function", "What it does"]}
          caption="Public functions of MandateRegistry."
        />
      </DocsSection>

      <DocsSection id="anchor-registry" title="AnchorRegistry">
        <DocsProse>
          Anchors the budget chain so a bundle that starts mid-sequence can still be placed.
        </DocsProse>
        <DefTable
          rows={ANCHOR_FUNCTIONS}
          head={["Function", "What it does"]}
          caption="Public functions of AnchorRegistry."
        />
      </DocsSection>

      <DocsSection id="account" title="The account">
        <DefTable rows={ACCOUNT_ROWS} caption="How the 2-of-3 account authorises an action." />
        <Snippet caption="shell" source={CLI_SNIPPET} />
        <Note title="No key touches the script">{CLI_NOTE}</Note>
      </DocsSection>

      <DocsSection id="pointing" title="Pointing the reader elsewhere">
        <DocsProse>
          The reader takes the endpoint and the registry addresses, so testnet or a fork is a
          matter of configuration. Leave an address null and the checks that need it report unknown
          instead of failing — a fail would read as an accusation the evidence does not support.
        </DocsProse>
        <Snippet caption="reader.ts" source={READER_SNIPPET} />
      </DocsSection>

      <DocsPager href="/docs/chain" />
    </>
  );
}

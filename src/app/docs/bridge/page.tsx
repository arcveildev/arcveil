import type { Metadata } from "next";
import { DefTable } from "@/components/docs/DefTable";
import { DocsHeader } from "@/components/docs/DocsHeader";
import { DocsPager } from "@/components/docs/DocsPager";
import { DocsProse, DocsSection } from "@/components/docs/DocsSection";
import { Note } from "@/components/docs/Note";
import { Snippet } from "@/components/docs/Snippet";
import {
  ASP_NOTE,
  AUDIT_NOTE,
  BRIDGE_DOC,
  CCTP_ROWS,
  GATEWAY_FUNCTIONS,
  HOOK_NOTE,
  HOOK_SNIPPET,
  LEDGER_ROWS,
  NEVER_REVERT_NOTE,
  PRECOMPILE_NOTE,
  RELAY_SNIPPET,
  VEIL_ROWS,
  WITHDRAW_SNIPPET,
} from "@/data/docs/bridge";

export const metadata: Metadata = {
  title: "The private bridge",
  description: BRIDGE_DOC.lede,
  alternates: { canonical: "/docs/bridge" },
};

export default function BridgeDocsPage() {
  return (
    <>
      <DocsHeader
        label={BRIDGE_DOC.label}
        title={BRIDGE_DOC.title}
        tagline={BRIDGE_DOC.tagline}
        lede={BRIDGE_DOC.lede}
      />

      <DocsSection id="ledger" title="What is hidden">
        <DocsProse>
          One line of the table below is the product. The rest is the price, and reading them in
          this order is the only way the claim means anything.
        </DocsProse>
        <DefTable rows={LEDGER_ROWS} head={["Fact", "Who sees it"]} caption="What the bridge publishes and what it does not." />
        <Note title="Privacy here is a crowd" tone="warn">
          It is worth exactly as much as the number of deposits sitting in the pool alongside yours.
          The first depositor into an empty pool has none at all, and depositing an unusual amount
          then withdrawing the same amount an hour later gives you away whatever the cryptography does.
        </Note>
      </DocsSection>

      <DocsSection id="cctp" title="CCTP on Arc">
        <DocsProse>
          Circle&apos;s CCTP V2 is live on Arc mainnet and testnet. Every address below was confirmed
          by reading the chain, not by copying a document.
        </DocsProse>
        <DefTable rows={CCTP_ROWS} caption="CCTP V2 as deployed on Arc." />
        <Note title="Two addresses, one gateway">{HOOK_NOTE}</Note>
      </DocsSection>

      <DocsSection id="deposit" title="Depositing">
        <DocsProse>
          Two transactions on the source chain, built locally and sent from your own wallet.
        </DocsProse>
        <Snippet caption="deposit.ts" source={HOOK_SNIPPET} />
        <Note title="The gateway never reverts after the mint" tone="warn">
          {NEVER_REVERT_NOTE}
        </Note>
      </DocsSection>

      <DocsSection id="gateway" title="VeilGateway">
        <DocsProse>
          One contract, no owner, no pause, no sweep. It holds funds only inside a single transaction.
        </DocsProse>
        <DefTable rows={GATEWAY_FUNCTIONS} head={["Function", "What it does"]} caption="The gateway's whole surface." />
        <DefTable rows={VEIL_ROWS} caption="Deployed addresses. Null until DeployVeil.s.sol has run." />
      </DocsSection>

      <DocsSection id="withdraw" title="Withdrawing">
        <DocsProse>
          The proof is built where the secrets are and nowhere else. What reaches the relayer is the
          proof and eight public numbers, none of which names a deposit.
        </DocsProse>
        <Snippet caption="withdraw.ts" source={WITHDRAW_SNIPPET} />
        <Snippet caption="shell" source={RELAY_SNIPPET} />
        <Note title="Why a relayer at all">
          Gas on Arc is USDC, so a freshly created recipient has nothing to pay with. Funding it
          first from a wallet you already own would rebuild, in one transfer, the link the pool was
          used to break. The relayer is paid out of the withdrawal instead.
        </Note>
      </DocsSection>

      <DocsSection id="asp" title="The association set">
        <Note title="Unfiltered today" tone="warn">
          {ASP_NOTE}
        </Note>
        <Note title="Arc can refuse a transfer" tone="warn">
          {PRECOMPILE_NOTE}
        </Note>
      </DocsSection>

      <DocsSection id="audit" title="What is audited, and what is not">
        <DocsProse>{AUDIT_NOTE}</DocsProse>
      </DocsSection>

      <DocsPager href="/docs/bridge" />
    </>
  );
}

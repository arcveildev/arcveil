import type { Metadata } from "next";
import { DefTable } from "@/components/docs/DefTable";
import { DocsHeader } from "@/components/docs/DocsHeader";
import { DocsPager } from "@/components/docs/DocsPager";
import { DocsProse, DocsSection } from "@/components/docs/DocsSection";
import { Note } from "@/components/docs/Note";
import { Snippet } from "@/components/docs/Snippet";
import {
  EXPORT_ROWS,
  IMMUTABILITY_NOTE,
  INSTALL,
  INSTALL_DEP,
  INTENT_SNIPPET,
  ISSUE_SNIPPET,
  KEY_NOTE,
  MANDATE_SNIPPET,
  SDK_PAGE,
  VERIFY_SNIPPET,
} from "@/data/docs/sdk";

export const metadata: Metadata = {
  title: "TypeScript SDK",
  description: SDK_PAGE.lede,
  alternates: { canonical: "/docs/sdk" },
};

export default function SdkPage() {
  return (
    <>
      <DocsHeader
        label={SDK_PAGE.label}
        title={SDK_PAGE.title}
        tagline={SDK_PAGE.tagline}
        lede={SDK_PAGE.lede}
      />

      <DocsSection id="install" title="Install">
        <DocsProse>
          The package is not on npm. It lives in this repository as a workspace package, with viem
          as a peer dependency.
        </DocsProse>
        <Snippet caption="shell" source={INSTALL} />
        <Snippet caption="package.json" source={INSTALL_DEP} />
      </DocsSection>

      <DocsSection id="verify" title="Verify">
        <DocsProse>
          Parse first — anything arriving as text is untrusted — then run the checks against a chain
          reader. Arc allows cross-origin requests, so the same code runs in a browser with no
          backend in the path.
        </DocsProse>
        <Snippet caption="verify.ts" source={VERIFY_SNIPPET} />
      </DocsSection>

      <DocsSection id="mandate" title="Publish a mandate">
        <DocsProse>
          Only the commitment reaches the chain. Keep the terms you hashed: without them you can
          prove a mandate was live, but never again show what it said. An epoch can be revoked,
          never overwritten — otherwise terms could change after receipts had been issued against
          them.
        </DocsProse>
        <Snippet caption="mandate.ts" source={MANDATE_SNIPPET} />
      </DocsSection>

      <DocsSection id="issue" title="Issue receipts">
        <DocsProse>
          An issuer holds the head of the budget chain and the mandate the receipts are checked
          against.
        </DocsProse>
        <Snippet caption="issue.ts" source={ISSUE_SNIPPET} />
        <Note title="The issuer is immutable">{IMMUTABILITY_NOTE}</Note>
        <Note title="This is not an enclave" tone="warn">
          {KEY_NOTE}
        </Note>
      </DocsSection>

      <DocsSection id="account" title="Sign an account intent">
        <DocsProse>
          The account executes only what two of its three keys signed, and only while the mandate
          named in the intent is live. The EIP-712 payload covers that mandate, so a signature
          gathered for one can never be replayed against another. Relaying is permissionless —
          authority is in the signatures, not in the sender.
        </DocsProse>
        <Snippet caption="intent.ts" source={INTENT_SNIPPET} />
      </DocsSection>

      <DocsSection id="exports" title="Exports">
        <DefTable
          rows={EXPORT_ROWS}
          head={["Symbol", "What it does"]}
          caption="The public surface of @arcveildev/sdk."
        />
      </DocsSection>

      <DocsPager href="/docs/sdk" />
    </>
  );
}

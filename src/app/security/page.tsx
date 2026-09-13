import type { Metadata } from "next";
import { LegalPage, placeholderSections } from "@/components/layout/LegalPage";
import { SITE } from "@/data/site";

export const metadata: Metadata = { title: `${SITE.name} | Security Policy` };

const SECTIONS = placeholderSections(["Key handling and mandate storage", "Enclave attestation and policy signing", "Responsible disclosure"]);

export default function SecurityPage() {
  return <LegalPage title="Security Policy" updated="September 2026" sections={SECTIONS} />;
}

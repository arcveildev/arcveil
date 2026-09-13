import type { Metadata } from "next";
import { LegalPage, placeholderSections } from "@/components/layout/LegalPage";
import { SITE } from "@/data/site";

export const metadata: Metadata = { title: `${SITE.name} | Terms of Service` };

const SECTIONS = placeholderSections(["Acceptance of terms", "Use of the platform", "Billing and termination"]);

export default function TermsOfServicePage() {
  return <LegalPage title="Terms of Service" updated="September 2026" sections={SECTIONS} />;
}

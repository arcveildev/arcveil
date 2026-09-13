import type { Metadata } from "next";
import { LegalPage, placeholderSections } from "@/components/layout/LegalPage";
import { SITE } from "@/data/site";

export const metadata: Metadata = { title: `${SITE.name} | Privacy Policy` };

const SECTIONS = placeholderSections(["Data we collect", "How we use your data", "Your rights and choices"]);

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy Policy" updated="September 2026" sections={SECTIONS} />;
}

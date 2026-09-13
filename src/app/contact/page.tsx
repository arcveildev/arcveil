import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: `${SITE.name} | Book a call`,
  description: "Tell us what your agents need to do with money, and we'll show you how a mandate would bound it.",
};

const COPY = {
  label: "Mandates / Receipts / SDK",
  title: "Let your agents spend, without letting them see.",
  body: "Tell us what your agents need to do with money. We'll walk you through the mandate that would bound it, and the receipts you would get back.",
} as const;

export default function ContactPage() {
  return (
    <div className="grid gap-10 pt-28 pb-20 lg:grid-cols-2 xl:pt-36">
      <div className="flex flex-col items-start gap-4">
        <span className="label text-fg-muted">{COPY.label}</span>
        <h1 className="max-w-lg text-7 leading-120 text-fg md:text-[40px]">{COPY.title}</h1>
        <p className="max-w-md text-sm leading-140 text-fg-muted">{COPY.body}</p>
      </div>
      <ContactForm />
    </div>
  );
}

import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: `${SITE.name} | Book a call`,
  description: "Tell us what you need and we'll route you to the right compute, training, or evals expert.",
};

const COPY = {
  label: "Evals / RL / Compute",
  title: "Build faster on the open stack for agents.",
  body: "Tell us what you need. We'll route your request to the right compute, training, or evals expert and give you a time to talk next.",
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

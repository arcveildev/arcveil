import { Button } from "@/components/ui/Button";
import { CTA } from "@/data/site";
import { HOME_HERO } from "@/data/home";

export function Thesis() {
  return (
    <section className="flex flex-col gap-6 border-x border-t border-border px-4 py-10 md:px-8 md:py-14 lg:px-12 lg:py-20">
      <span className="label text-fg-muted">{HOME_HERO.label}</span>
      <h1 className="max-w-3xl text-7 leading-120 text-fg md:text-[40px] lg:text-[52px]">{HOME_HERO.title}</h1>
      <p className="max-w-2xl text-sm leading-140 text-fg-muted">{HOME_HERO.body}</p>
      <div className="flex items-center gap-1 pt-2">
        <Button href={CTA.primary.href}>{CTA.primary.label}</Button>
        <Button href={CTA.secondary.href} variant="secondary">
          {CTA.secondary.label}
        </Button>
      </div>
    </section>
  );
}

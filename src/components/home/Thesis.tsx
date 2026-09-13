import { Button } from "@/components/ui/Button";
import { HeroBackdrop } from "./HeroBackdrop";
import { CTA } from "@/data/site";
import { HOME_HERO } from "@/data/home";

export function Thesis() {
  return (
    <section className="relative flex flex-col gap-6 overflow-hidden border-x border-t border-border px-4 py-10 md:px-8 md:py-14 lg:px-12 lg:py-20">
      <HeroBackdrop />
      <span className="relative z-10 label text-fg-muted">{HOME_HERO.label}</span>
      <h1 className="relative z-10 max-w-3xl text-7 leading-120 text-fg md:text-[40px] lg:text-[52px]">{HOME_HERO.title}</h1>
      <p className="relative z-10 max-w-2xl text-sm leading-140 text-fg-muted">{HOME_HERO.body}</p>
      <div className="relative z-10 flex items-center gap-1 pt-2">
        <Button href={CTA.primary.href}>{CTA.primary.label}</Button>
        <Button href={CTA.secondary.href} variant="secondary">
          {CTA.secondary.label}
        </Button>
      </div>
    </section>
  );
}
